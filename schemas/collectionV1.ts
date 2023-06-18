/**
 * This is a initial schema where the whole stack is powered by Polybase
 * includes:
 * - profiles
 * - source material (aka books)
 * - clubs
 * - club material
 * - club memberships
 * - club discussions
 * - rsvp
 */
const polybaseSchema = `
/**
 * This is a initial schema where the whole stack is powered by Polybase
 * includes:
 * - profiles
 * - source material (aka books)
 * - clubs
 * - club material
 * - club memberships
 * - club discussions
 * - rsvp
 */

@public
collection UserProfile {
  id: string;
  @delegate
  publicKey: PublicKey;
  publicAddress: string;
  displayName: string; 
  bio: string;
  avatarURI: string;

  constructor (publicAddress: string, displayName: string, bio: string, avatarURI: string) {
    this.id = publicAddress;
    this.publicKey = ctx.publicKey;
    this.publicAddress = ctx.publicKey.toHex();
    this.displayName = displayName;
    this.bio = bio;
    this.avatarURI = avatarURI;
  }

  function updateProfile (displayName: string, bio: string, avatarURI: string) {
    if (ctx.publicKey != this.publicKey) {
      error('Only the owner of this profile can update it.');
    }
    this.displayName = displayName;
    this.bio = bio;
    this.avatarURI = avatarURI;
  }

  del () {
    if (this.publicKey != ctx.publicKey) {
      throw error();
    }
    selfdestruct();
  }
}

// SourceMaterial = fun stuff
// For now, all medias are books
// But hearthside hangouts could evolve to support all types of cultural clubs :)
@public
  collection SourceMaterial {
    id: string;
    title: string;
    description: string;
    authors: string[];
    ratings: map<PublicKey, number>;
    format: string; // audio, text, video, game
    type: string; // eg: book, audiobook...
    maturityRating?: string;
    yearPublished?: string;
    thumbnailURI?: string;
    language?: string;
    genres?: string[];
    tableOfContents?: string[];

    @index(title);
    
    constructor( id: string, title: string, description: string, authors: string[], format: string, type: string, thumbnailURI?: string, language?: string, genres?: string[], yearPublished?: string,  maturityRating?: string, tableOfContents?: string[]) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.authors = authors;
      this.yearPublished = yearPublished;
      this.thumbnailURI = thumbnailURI;
      this.ratings = {};
      this.format = format;
      this.type = type;
      this.genres = genres;
      this.language = language;
      this.tableOfContents = tableOfContents;
    }

    function setTableOfContents(tableOfContents: string[]) {
      this.tableOfContents = tableOfContents;
    }

    function rate(score: number) {
        this.ratings[ctx.publicKey] = score;
    }
  }

// Club
// We keep its name generic since the concept of hearthside hangout could evolve and have cultural clubs that aren't only bookclubs (writing clubs, movie clubs, music clubs, gaming clubs...)
@public
  collection Club {
    id: string;
    name: string;
    description: string;
    genres: string[];
    creator: UserProfile;
    creatorPublicKey: PublicKey;
    coverURI: string;
    openToNewMembers: boolean;
    currentClubMaterial: string;

    @index(creator);
    @index(name);
    
    constructor (id: string, name: string, description: string, genres: string[], creator: UserProfile, coverURI: string, openToNewMembers: boolean ) {
      this.id = id;
      this.creatorPublicKey = ctx.publicKey;
      this.name = name;
      this.description = description;
      this.genres = genres;
      this.creator = creator;
      this.coverURI = coverURI;
      this.openToNewMembers = openToNewMembers;
    }

    function updateClubInfo (name: string, description: string, genres: string[],  coverURI: string, openToNewMembers: boolean) {
      // Check if the caller is the original creator of the record.
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can update the club info.');
      }
      this.name = name;
      this.description = description;
      this.genres = genres;
      this.coverURI= coverURI;
      this.openToNewMembers = openToNewMembers;
    }

    function setCurrentMaterial (currentClubMaterial: string) {
      // Check if the caller is the original creator of the record.
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can update the current material.');
      }
      this.currentClubMaterial = currentClubMaterial;
    }

    del () {
    if (this.creatorPublicKey != ctx.publicKey) {
      throw error();
    }
    selfdestruct();
  }
}

@public
  collection ClubMembership {
    id: string;
    club: Club;
    member: UserProfile;
    memberPublicKey: PublicKey;
    canRevoke: PublicKey[];
    @index(club);
    @index(member);

    constructor (id: string, club: Club, member: UserProfile) {
      this.id = id;
      this.memberPublicKey = ctx.publicKey;
      this.member = member;
      this.club = club;
      this.canRevoke = [ctx.publicKey, club.creatorPublicKey];
    }

    del () {
    if (!this.canRevoke.includes(ctx.publicKey)) {
      throw error();
    }
    selfdestruct();
  }
}

// What the club is currently using as their reading material
@public
  collection ClubMaterial {
    id: string;
    club: Club;
    material: SourceMaterial;
    creatorPublicKey: PublicKey;
    milestones: string[]; // we store milestones as a stringified objects with the following shape: { title ; notes ; start ; end }
    createdAt: number;
    
    @index(material);
    @index(club);

    constructor (id: string, material: SourceMaterial, club: Club, createdAt: number) {
      this.id = id;
      this.creatorPublicKey = ctx.publicKey;
      this.material = material;
      this.milestones = [];
      this.club = club;
      this.createdAt = createdAt;
    }

    function setMilestones(milestones: string[]) {
      if (ctx.publickKey != this.club.creatorPublicKey && ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can configure the milestones.');
      }
      this.milestones = milestones;
    }

    del () {
    if (ctx.publickKey != this.club.creatorPublicKey && ctx.publicKey != this.creatorPublicKey) {
      throw error();
    }
    selfdestruct();
  }
}

// Post
// Post can be sent to different channels ; posts have content ; posts can receive responses ;
@public
collection ClubPost {
    id: string;
    idChannel: string;
    club: Club;
    proofOfMembership?: ClubMembership;
    content: string;
    reactions: map<PublicKey, number>;  
    parentPost?: ClubPost;
    creator: UserProfile;
    createdAt: number;
  
    @index(club);
    @index(idChannel);
    @index(parentPost);

    constructor (id: string, idChannel: string, club: Club, creator: UserProfile, content: string, createdAt: number, proofOfMembership?: ClubMembership,  parentPost?: ClubPost) {
      if (ctx.publicKey != creator.publicKey) {
        error('Only club members can post.');
      }

      if(creator.publicKey == club.creatorPublicKey) {
                this.id = id;
        this.idChannel = idChannel;
        this.club = club;
        this.content = content;
        this.reactions = {};
        this.parentPost = parentPost;
        this.creator = creator;
        this.createdAt = createdAt;

      } 
      
      if(creator.publicKey != club.creatorPublicKey){
       if (proofOfMembership.memberPublicKey != ctx.publicKey && proofOfMembership.club.id != club.id) {
          error('Only club members can post.');
        }
        this.id = id;
        this.idChannel = idChannel;
        this.club = club;
        this.content = content;
        this.reactions = {};
        this.parentPost = parentPost;
        this.creator = creator;
        this.createdAt = createdAt;
        this.proofOfMembership = proofOfMembership;
      }
    }
  
  function react(reaction: string, proofOfMembership?: ClubMembership) {
    // Verify that the current user isn't impersonating another user and is a member of the club
          if(proofOfMembership.memberPublicKey) {
        if (proofOfMembership.memberPublicKey != ctx.publicKey && proofOfMembership.club.id != club.id) {
          error('Only club members can react to posts.');
        }
      }
      if (ctx.publicKey != creator.publicKey) {
        error('Only club members can react to posts.');
      }

      this.reactions[ctx.publicKey] = reaction;
    }

  del () {
    if (ctx.publickKey != this.club.creator.publicKey || ctx.publicKey != this.creator.publicKey) {
      throw error();
    }
    selfdestruct();
  }

}

// Store the events for which the user RSVPed
collection RSVP {
  id: string;
  idEvent: string;
  @read
  profile: UserProfile;

  @index(profile);
  @index(idEvent);

  constructor (id: string, idEvent: string, profile: UserProfile) {
      this.id = id;
      this.profile = profile;
      this.idEvent = idEvent;
  }
  @call(profile)
  del () {
  if (ctx.publickKey != this.profile.publicKey) {
      throw error();
    }
    selfdestruct();
  }
}
/**
  Dropped collections
  we don't use those
*/

collection ClubDiscussion {
  id: string;
}
collection City {
  id: string;
}
collection Media {
  id: string;
}
collection Milestone {
  id: string;
}
collection Milestones {
  id: string;
}

`
