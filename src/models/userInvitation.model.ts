// src/models/userInvitation.model.ts

// Model untuk tabel user_invitation
export class UserInvitation {
  // ID primary key (opsional karena biasanya auto increment dari DB)
  id?: number;

  // ID user yang menerima undangan
  user_id: number;

  // Token undangan
  token: string;

  // Tanggal dibuatnya undangan (opsional karena biasanya di-set otomatis oleh DB)
  created_at?: Date;

  constructor(user_id: number, token: string, created_at?: Date, id?: number) {
    this.user_id = user_id;
    this.token = token;
    this.created_at = created_at;
    this.id = id;
  }
}
