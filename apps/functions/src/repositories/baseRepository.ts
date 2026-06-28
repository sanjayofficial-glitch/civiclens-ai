import { db } from '../lib/firebase';

export class BaseRepository<_T extends FirebaseFirestore.DocumentData> {
  constructor(protected readonly collectionName: string) {}

  protected collection() {
    return db.collection(this.collectionName);
  }

  doc(id: string) {
    return this.collection().doc(id);
  }

  async get(id: string) {
    return this.doc(id).get();
  }
}
