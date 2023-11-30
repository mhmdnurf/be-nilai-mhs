const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");

const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "nilai_mhs",
});

db.connect((err) => {
  if (err) {
    console.error("Error koneksi ke database:", err);
  } else {
    console.log("Terhubung ke database MySQL");
  }
});
app.get("/api/mahasiswa", (req, res) => {
  const query = `
        SELECT nim, nama, uts, kuis, tugas, kehadiran, uas, nilai_akhir, predikat
        FROM nilai_mhs
    `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Gagal mengambil data mahasiswa:", err);
      res.status(500).json({ error: "Gagal mengambil data mahasiswa" });
    } else {
      const dataMahasiswa = result;
      res.status(200).json(dataMahasiswa);
    }
  });
});
app.post("/api/mahasiswa", (req, res) => {
  const { nim, nama, uts, kuis, tugas, kehadiran, uas } = req.body;
  const nilaiAkhir =
    uts * 0.15 + kuis * 0.15 + tugas * 0.25 + 0.15 * kehadiran + uas * 0.3;

  let predikat = "";
  if (nilaiAkhir >= 100) {
    predikat = "Sangat Baik";
  } else if (nilaiAkhir >= 75) {
    predikat = "Baik";
  } else if (nilaiAkhir >= 55) {
    predikat = "Cukup";
  } else if (nilaiAkhir >= 30) {
    predikat = "Kurang";
  } else {
    predikat = "Silahkan Anda Mengulang";
  }

  const query = `
        INSERT INTO nilai_mhs (nim, nama, uts, kuis, tugas, kehadiran, uas, nilai_akhir, predikat)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  const values = [
    nim,
    nama,
    uts,
    kuis,
    tugas,
    kehadiran,
    uas,
    nilaiAkhir,
    predikat,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Gagal menyimpan data mahasiswa:", err);
      res.status(500).json({ error: "Gagal menyimpan data mahasiswa" });
    } else {
      console.log("Data mahasiswa berhasil disimpan");
      console.log(`Nilai Akhir: ${nilaiAkhir}, Predikat: ${predikat}`);
      res.status(201).json({ message: "Data mahasiswa berhasil disimpan" });
    }
  });
});

app.delete("/api/mahasiswa/:nim", (req, res) => {
  const nim = req.params.nim;
  const query = `
      DELETE FROM nilai_mhs
      WHERE nim = ?
    `;

  db.query(query, [nim], (err, result) => {
    if (err) {
      console.error("Gagal menghapus data mahasiswa:", err);
      res.status(500).json({ error: "Gagal menghapus data mahasiswa" });
    } else {
      console.log(`Data mahasiswa dengan NIM ${nim} berhasil dihapus`);
      res
        .status(200)
        .json({ message: `Data mahasiswa dengan NIM ${nim} berhasil dihapus` });
    }
  });
});
app.put("/api/mahasiswa/:nim", (req, res) => {
  const nimToUpdate = req.params.nim;
  const { nim, nama, uts, kuis, tugas, kehadiran, uas } = req.body;

  const query = `
      UPDATE nilai_mhs
      SET nim=?, nama=?, uts=?, kuis=?, tugas=?, kehadiran=?, uas=?, nilai_akhir=((uts * 0.15) + (0.15 * kuis) + (0.25 * tugas) + (0.15 * kehadiran) + (0.3 * uas)) , predikat=
        CASE
          WHEN ((uts * 0.15) + (0.15 * kuis) + (0.25 * tugas) + (0.15 * kehadiran) + (0.3 * uas)) >= 100 THEN 'Sangat Baik'
          WHEN ((uts * 0.15) + (0.15 * kuis) + (0.25 * tugas) + (0.15 * kehadiran) + (0.3 * uas)) >= 75 THEN 'Baik'
          WHEN ((uts * 0.15) + (0.15 * kuis) + (0.25 * tugas) + (0.15 * kehadiran) + (0.3 * uas)) >= 55 THEN 'Cukup'
          WHEN ((uts * 0.15) + (0.15 * kuis) + (0.25 * tugas) + (0.15 * kehadiran) + (0.3 * uas)) >= 30 THEN 'Kurang'
          ELSE 'Silahkan Anda Mengulang'
        END
      WHERE nim=?
    `;

  const values = [nim, nama, uts, kuis, tugas, kehadiran, uas, nimToUpdate];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Gagal mengubah data mahasiswa:", err);
      res.status(500).json({ error: "Gagal mengubah data mahasiswa" });
    } else {
      console.log("Data mahasiswa berhasil diubah");
      res.status(200).json({ message: "Data mahasiswa berhasil diubah" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}/api/mahasiswa`);
});
