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

// Media = fun stuff
// For now, all medias are books
// But hearthside hangouts could evolve to support all types of cultural clubs :)
@public
  collection Media {
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
    materialList: ClubMaterial[]; // We need to keep track of the different material the club went through, so we'll use an array to keep track ; last element in the array = current material
    @index(creator);
    
    constructor (id: string, name: string, description: string, genres: string[], creator: UserProfile, coverURI: string, openToNewMembers: boolean ) {
      this.id = id;
      this.creatorPublicKey = ctx.publicKey;
      this.name = name;
      this.description = description;
      this.genres = genres;
      this.creator = creator;
      this.coverURI = coverURI;
      this.openToNewMembers = openToNewMembers;
      this.materialList = [];
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

    function addNewReadingMaterial(material: ClubMaterial) { 
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can set the material used by the club.');
      }
      this.materialList = materialList.push(material);
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
    material: Media;
    milestones: Milestone[];
    creatorPublicKey: PublicKey;

    @index(material);

    constructor (id: string, material: Media, milestones:  Milestone[] ) {
      this.id = id;
      this.creatorPublicKey = ctx.publicKey;
      this.material = material;
      this.milestones = milestones;
    }

    function setMilestones(milestones: Milestone[]) {
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can configure the milestones.');
      }
      this.milestones = milestones;
    }
}

@public
  collection Milestone {
    id: string;
    clubMaterial: ClubMaterial;
    creatorPublicKey: PublicKey;
    title: string;
    notes: string;
    start: number;
    end: number;
    
    @index(clubMaterial);
    constructor (id: string, title: string, notes: string, start: number, end: number, clubMaterial: ClubMaterial ) {
      this.id = id ;
      this.creatorPublicKey = ctx.publicKey;
      this.clubMaterial = clubMaterial;
      this.title = title;
      this.start = start;
      this.end = end;
      this.notes = notes;
    }

   del () {
    if (ctx.publicKey != this.creatorPublicKey) {
      throw error();
    }
    selfdestruct();
  }
}`
