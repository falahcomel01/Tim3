import { Shield, Sparkles } from 'lucide-react';

function AboutSection() {
  return (
    <section className="pillars-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Arti dari <span>SIBERMERCH</span></h2>
          <p className="section-description">Setiap desain kaos merefleksikan nilai-nilai utama yang dijunjung oleh Himpunan Mahasiswa Sistem Informasi SIBER.</p>
        </div>

        <div className="pillars-grid">
          <div className="pillar-card research">
            <div className="pillar-icon-box">
              <Shield size={26} />
            </div>
            <h3 className="pillar-name">SIBER</h3>
            <p className="pillar-desc">
              Pilar keilmuan dan kecerdasan analitis. Kami mendorong inovasi riset teknologi, logika sistem informasi, dan memegang teguh etika digital untuk kemajuan peradaban teknologi informasi.
            </p>
          </div>

          <div className="pillar-card synergy">
            <div className="pillar-icon-box">
              <Sparkles size={26} />
            </div>
            <h3 className="pillar-name">MERCH</h3>
            <p className="pillar-desc">
              Ini adalah singkatan dari kata merchandise, yang artinya barang dagangan. Merch biasanya merujuk pada produk fisik (seperti kaos, hoodie, stiker, lanyard, atau tote bag) yang dijual sebagai identitas kebanggaan sebuah brand, komunitas, kampus, band, atau acara tertentu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
