import { AgentId, AgentConfig } from './types';

// The system instruction exactly as requested in the prompt design
export const MASTER_AGENT_SYSTEM_INSTRUCTION = `
Anda adalah Koordinator Sistem Rumah Sakit Digital (Hospital System Coordinator). Tugas mutlak Anda adalah menganalisis setiap permintaan pengguna (staf administrasi atau medis) dan **merutekannya** secara eksklusif ke salah satu dari empat subagen spesialis berikut. Keputusan perutean harus didasarkan murni pada FUNGSI INTI dari subagen tersebut. JANGAN memproses permintaan itu sendiri.

| Subagen | Fungsi Inti | Contoh Permintaan yang Ditangani |
| :--- | :--- | :--- |
| **Manajemen Pasien** | Pendaftaran, Pembaruan Demografi, Status Pasien (Rawat Inap/Keluar) | "Daftarkan pasien baru bernama Andi.", "Ubah alamat pasien ID 123.", "Konfirmasi pemulangan pasien." |
| **Rekam Medis** | Mengambil/Memperbarui/Meringkas Riwayat Medis, Diagnosis, Resep, Hasil Lab. | "Ambil riwayat diagnosis RME pasien Budi.", "Tambahkan resep obat untuk pasien." |
| **Penagihan dan Pembayaran** | Detail Tagihan, Pemrosesan Pembayaran, Pembuatan Faktur, Sengketa Keuangan. | "Berapa total tagihan pasien NIK 456?", "Proses pembayaran klaim asuransi.", "Buatkan faktur layanan radiologi." |
| **Penjadwalan Janji Temu** | Memesan, Mengubah, Membatalkan Janji Temu Dokter atau Layanan. | "Jadwalkan janji temu dengan Dr. Sari minggu depan.", "Batalkan janji temu pasien Toni." |
`;

export const AGENTS: Record<AgentId, AgentConfig> = {
  [AgentId.MASTER]: {
    id: AgentId.MASTER,
    name: 'Koordinator Sistem (Master)',
    description: 'Menganalisis maksud dan merutekan ke spesialis.',
    color: 'bg-indigo-600',
    iconName: 'BrainCircuit',
  },
  [AgentId.PATIENT]: {
    id: AgentId.PATIENT,
    name: 'Manajemen Pasien',
    description: 'Pendaftaran & Demografi',
    color: 'bg-emerald-500',
    iconName: 'UserPlus',
  },
  [AgentId.RECORDS]: {
    id: AgentId.RECORDS,
    name: 'Rekam Medis',
    description: 'Riwayat Klinis & Lab',
    color: 'bg-blue-500',
    iconName: 'FileHeart',
  },
  [AgentId.BILLING]: {
    id: AgentId.BILLING,
    name: 'Penagihan dan Pembayaran',
    description: 'Faktur & Asuransi',
    color: 'bg-amber-500',
    iconName: 'Receipt',
  },
  [AgentId.SCHEDULING]: {
    id: AgentId.SCHEDULING,
    name: 'Penjadwalan Janji Temu',
    description: 'Booking & Kalender',
    color: 'bg-rose-500',
    iconName: 'CalendarClock',
  },
};

// Helper to map the string returned by AI to our AgentId enum
export const mapAgentNameToId = (agentName: string): AgentId => {
  const normalized = agentName.toLowerCase();
  if (normalized.includes('pasien') || normalized.includes('patient')) return AgentId.PATIENT;
  if (normalized.includes('rekam') || normalized.includes('records')) return AgentId.RECORDS;
  if (normalized.includes('tagihan') || normalized.includes('billing') || normalized.includes('pembayaran')) return AgentId.BILLING;
  if (normalized.includes('jadwal') || normalized.includes('scheduling')) return AgentId.SCHEDULING;
  return AgentId.MASTER; // Fallback
};
