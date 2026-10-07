import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiFileText,
  FiCreditCard,
  FiClock,
  FiCpu,
  FiGrid,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher';
import styles from './LandingPage.module.css';

const FEATURES = [
  {
    icon: FiUsers,
    title: 'Customers',
    desc: 'Every customer, their history, and every conversation in one profile — no more digging through WhatsApp threads.',
  },
  {
    icon: FiFileText,
    title: 'Quotes',
    desc: 'Send professional, branded quotations in minutes, and know the moment a customer opens one.',
  },
  {
    icon: FiCreditCard,
    title: 'Invoices',
    desc: 'Turn accepted quotes into invoices with one click. Track exactly who owes you what, and since when.',
  },
  {
    icon: FiClock,
    title: 'Follow-ups',
    desc: "Never let a quote go cold. MtejaFlow tells you exactly who to follow up with, and why, every morning.",
  },
];

const STEPS = [
  { title: 'Set up your business', desc: 'Add your logo, currency and details — takes under two minutes.' },
  { title: 'Add customers and send quotes', desc: 'Build your customer list and start quoting jobs immediately.' },
  { title: 'Let MtejaFlow watch your business', desc: 'Get a daily brief on revenue, unpaid invoices, and who needs a nudge.' },
];

const FAQS = [
  {
    q: 'Do I need to be technical to use this?',
    a: "No. MtejaFlow is built for business owners, not accountants or developers. If you can use WhatsApp, you can use MtejaFlow.",
  },
  {
    q: 'Is my business data safe?',
    a: 'Yes. Every business\u2019s data is fully isolated — no other business, and no other user, can ever see your customers, quotes or invoices.',
  },
  {
    q: 'Does it work in Swahili?',
    a: 'Yes. MtejaFlow is available in English and Swahili from day one, with more languages planned.',
  },
  {
    q: 'What happens after the free plan?',
    a: "You can keep using MtejaFlow's free tier for light use, or upgrade for unlimited customers, quotes and AI assistance.",
  },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navBrand}>
          <span className={styles.brandMark}>M</span>
          <span>MtejaFlow</span>
        </div>
        <nav className={styles.navLinks}>
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className={styles.navActions}>
          <LanguageSwitcher />
          <Link to="/login" className={styles.navLogin}>Log in</Link>
          <Link to="/signup" className={styles.navCta}>Start for free</Link>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>Mteja AI · Business Operating System</span>
          <h1 className={styles.h1}>Run your business with a brain.</h1>
          <p className={styles.heroSub}>
            Mteja AI brings customers, sales, invoices and business insights into one
            intelligent workspace — starting with MtejaFlow, built for small and
            medium businesses across Tanzania and East Africa.
          </p>
          <div className={styles.heroActions}>
            <Link to="/signup" className={styles.primaryBtn}>
              Start for free <FiArrowRight aria-hidden="true" />
            </Link>
            <a href="#how-it-works" className={styles.secondaryBtn}>See how it works</a>
          </div>
        </div>
        <div className={styles.heroCard} aria-hidden="true">
          <div className={styles.heroCardHeader}>
            <span className={styles.heroCardDot} />
            <span className={styles.heroCardDot} />
            <span className={styles.heroCardDot} />
          </div>
          <p className={styles.heroCardGreeting}>Good morning, Ahmed.</p>
          <ul className={styles.heroCardList}>
            <li><strong className="figure">TZS 4,800,000</strong> generated this month</li>
            <li><strong>7</strong> customers need follow-up</li>
            <li><strong className="figure">TZS 1,200,000</strong> in outstanding invoices</li>
            <li><strong className="figure">3</strong> quotations worth <strong className="figure">TZS 2,400,000</strong> awaiting reply</li>
          </ul>
        </div>
      </section>

      <div className={styles.motifDivider} />

      <section className={styles.problemSolution}>
        <div className={styles.psCol}>
          <span className={styles.eyebrow}>The problem</span>
          <h2 className={styles.h2}>Your business runs in your head, WhatsApp, and a notebook.</h2>
          <p className={styles.body}>
            Quotes get lost in chat threads. Invoices are tracked in your memory. You
            find out a customer owes you money weeks too late — if at all.
          </p>
        </div>
        <div className={styles.psCol}>
          <span className={styles.eyebrow}>The solution</span>
          <h2 className={styles.h2}>One place that actually understands your business.</h2>
          <p className={styles.body}>
            MtejaFlow keeps every customer, quote, invoice and follow-up organized —
            and tells you, in plain language, what needs your attention today.
          </p>
        </div>
      </section>

      <section id="features" className={styles.features}>
        <span className={styles.eyebrow} style={{ textAlign: 'center' }}>What's included</span>
        <h2 className={`${styles.h2} ${styles.centerHeading}`}>Everything you need to run sales, day to day.</h2>
        <div className={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIcon}><f.icon aria-hidden="true" /></div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.aiSection}>
        <div className={styles.aiText}>
          <div className={styles.featureIcon} style={{ marginBottom: 'var(--space-4)' }}>
            <FiCpu aria-hidden="true" />
          </div>
          <h2 className={styles.h2}>Ask your business anything.</h2>
          <p className={styles.body}>
            "Who owes me money?" "Who should I follow up with today?" "Write a
            polite payment reminder for John." MtejaFlow's AI assistant answers
            in plain language — in English or Swahili — using your real business
            data, securely.
          </p>
        </div>
        <div className={styles.aiChatMock} aria-hidden="true">
          <p className={styles.aiBubbleUser}>Who should I follow up with today?</p>
          <p className={styles.aiBubbleAi}>
            John Smith — website quotation, TZS 800,000, 5 days with no reply.
            Want me to draft a follow-up message?
          </p>
        </div>
      </section>

      <section id="how-it-works" className={styles.howItWorks}>
        <span className={styles.eyebrow} style={{ textAlign: 'center' }}>How it works</span>
        <h2 className={`${styles.h2} ${styles.centerHeading}`}>Up and running before your first cup of chai.</h2>
        <ol className={styles.stepsList}>
          {STEPS.map((step, i) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber}>{i + 1}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" className={styles.pricing}>
        <span className={styles.eyebrow} style={{ textAlign: 'center' }}>Pricing</span>
        <h2 className={`${styles.h2} ${styles.centerHeading}`}>Start free. Grow when you're ready.</h2>
        <div className={styles.pricingGrid}>
          <div className={styles.priceCard}>
            <h3 className={styles.featureTitle}>Free</h3>
            <p className={styles.price}>TZS 0<span>/month</span></p>
            <ul className={styles.priceFeatures}>
              <li><FiCheck aria-hidden="true" /> Up to 20 customers</li>
              <li><FiCheck aria-hidden="true" /> Quotes &amp; invoices</li>
              <li><FiCheck aria-hidden="true" /> Basic dashboard</li>
            </ul>
            <Link to="/signup" className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}>Start for free</Link>
          </div>
          <div className={`${styles.priceCard} ${styles.priceCardFeatured}`}>
            <h3 className={styles.featureTitle}>Growth</h3>
            <p className={styles.price}>Contact us<span></span></p>
            <ul className={styles.priceFeatures}>
              <li><FiCheck aria-hidden="true" /> Unlimited customers</li>
              <li><FiCheck aria-hidden="true" /> AI business assistant</li>
              <li><FiCheck aria-hidden="true" /> Follow-up automation</li>
              <li><FiCheck aria-hidden="true" /> Priority support</li>
            </ul>
            <Link to="/signup" className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>Start for free</Link>
          </div>
        </div>
      </section>

      <section id="faq" className={styles.faq}>
        <span className={styles.eyebrow} style={{ textAlign: 'center' }}>FAQ</span>
        <h2 className={`${styles.h2} ${styles.centerHeading}`}>Good questions.</h2>
        <div className={styles.faqList}>
          {FAQS.map((f) => (
            <details key={f.q} className={styles.faqItem}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <h2 className={styles.h2}>Your business. Understood.</h2>
        <p className={styles.body}>Set up MtejaFlow in minutes — no credit card required.</p>
        <Link to="/signup" className={styles.primaryBtn}>
          Start for free <FiArrowRight aria-hidden="true" />
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.navBrand}>
          <span className={styles.brandMark}><FiGrid /></span>
          <span>MtejaFlow by MtejaAI</span>
        </div>
        <p>EMBRYO™</p>
        <p>&copy; {new Date().getFullYear()} Mteja AI. Built for East African businesses.</p>
      </footer>
    </div>
  );
}
