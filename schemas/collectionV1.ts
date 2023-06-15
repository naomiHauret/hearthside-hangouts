/**
 * This is a initial schema where the whole stack is powered by Polybase
 * includes:
 * - profiles
 * - media (aka books)
 * - clubs
 * - club material
 * - milestones
 */
const polybaseSchema = `


/**
  Hearthside Hangouts
  Cultural clubs online meetups
  - Create your profile
  - Create your club
  - Set a study material (book, movie... but just books for  now)
  - Set milestones
  - Discuss with fellow club members
*/
@public
collection UserProfile {
  id: string;
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

    @index(title);
    
    constructor( id: string, title: string, description: string, authors: string[], format: string, type: string, thumbnailURI?: string, language?: string, genres?: string[], yearPublished?: string,  maturityRating?: string) {
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
    currentMaterial: ClubMaterial;

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

    function setCurrentMaterial (clubMaterial: ClubMaterial) {
      // Check if the caller is the original creator of the record.
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can update the current material.');
      }
      this.currentMaterial = clubMaterial;
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


/**
  Dropped collections
  we don't use those
*/

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
