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
}

// Media = fun stuff
// For now, all medias are books
// But hearthside hangouts could evolve to support all types of cultural clubs
@public
  collection Media {
    id: string;
    title: string;
    author: string;
    yearPublished?: string;
    thumbnailURI?: string;
    ratings: map<PublicKey, number>;
    format: string; // audio, text, video, game

    constructor( id: string, title: string, author: string, format: string, yearPublished?: string, thumbnailURI?: string) {
      this.id = id;
      this.title = title;
      this.author = author;
      this.publisher = publisher;
      this.yearPublished = yearPublished;
      this.originalPublicationYear = originalPublicationYear;
      this.thumbnailURI = thumbnailURI;
      this.ratings = {};
      this.format = format;
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
    membersList: map<PublicKey, UserProfile>;
    membersCount: number;
    creator: UserProfile;
    creatorPublicKey: PublicKey;
    coverURI: string;
    openToNewMembers: boolean;
    materialList: ClubMaterial[]; // We need to keep track of the different material the club went through, so we'll use an array to keep track ; last element in the array = current material
    
    constructor (id: string, name: string, description: string, genres: string[], creator: UserProfile, coverURI: string, openToNewMembers: boolean ) {
      this.id = id;
      this.creatorPublicKey = ctx.publicKey;
      this.name = name;
      this.description = description;
      this.genres = genres;
      this.creator = creator;
      this.coverURI = coverURI;
      this.openToNewMembers = openToNewMembers;
      this.membersList = {};
      this.membersCount = 1;
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

    function joinClub(profile: UserProfile) {
      if ( ctx.publicKey != profile.publicKey) {
        error('Only the owner of this profile can join a club.');
      }
      if (this.openToNewMembers == false) {
        error('This club is not open to new members.');
      }
      if (this.membersList[ctx.publicKey] != undefined) {
        error('You are already a member of this club.');
      }
      this.membersList[ctx.publicKey] = profile;
      this.membersCount = this.membersCount + 1;
    }

    function leaveClub() {
      if ( ctx.publicKey != profile.publicKey && ctx.publicKey != this.creatorPublicKey ) {
        error('Only the owner of this profile or the club creator can remove club membership.');
      }
      if (this.membersList[ctx.publicKey] == undefined) {
        error('There is no membership for this club associated to this profile.');
      }

      this.membersList[ctx.publicKey] = undefined;
      this.membersCount = this.membersCount - 1;
    }

    function addNewReadingMaterial(material: ClubMaterial) { 
      if (ctx.publicKey != this.creatorPublicKey) {
        error('Only the club creator can set the material used by the club.');
      }
      this.materialList = materialList.push(material);
    }
}

// What the club is currently using as their material
@public
  collection ClubMaterial {
    id: string;
    club: Club;
    material: Media;
    milestones: Milestone[];
    creatorPublicKey: PublicKey;

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
    club: Club;
    creatorPublicKey: PublicKey;
    title: string;
    notes: string;
    start: number;
    end: number;

    constructor (id: string, title: string, notes: string, start: number, end: number, club: Club ) {
      this.id = id ;
      this.creatorPublicKey = ctx.publicKey;
      this.club = club;
      this.title = title;
      this.start = start;
      this.end = end;
      this.notes = notes;
    }
}
`