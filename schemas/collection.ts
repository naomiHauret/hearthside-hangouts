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
      if (ctx.publicKey != this.creatorPublicKey) {
        error('This club is not open to new members.');
      }
      if (this.membersList[ctx.publicKey] == undefined) {
        error('There is no membership for this club associated to this profile.');
      }

      this.membersList[ctx.publicKey] = undefined;
      this.membersCount = this.membersCount - 1;
    }

  }
`