/* ============================================================
   LEADERSEDUTOUR — Premium JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR SCROLL EFFECT =====
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  // ===== DYNAMIC STORIES RENDERER =====
  const cms = window.LEADERS_CMS;

  const buildStoryCardElement = (story) => {
    const card = document.createElement('div');
    card.className = 'testimonial-card';

    const stars = document.createElement('div');
    stars.className = 'testimonial-stars';
    stars.textContent = '★★★★★';

    const quote = document.createElement('p');
    quote.className = 'testimonial-text';
    quote.textContent = `"${story.review}"`;

    const author = document.createElement('div');
    author.className = 'testimonial-author';

    const avatar = document.createElement('div');
    avatar.className = 'author-avatar';
    avatar.textContent = cms ? cms.getInitials(story.name) : 'ST';

    const info = document.createElement('div');
    info.className = 'author-info';

    const nameStrong = document.createElement('strong');
    nameStrong.textContent = story.name;
    info.appendChild(nameStrong);

    const schoolSpan = document.createElement('span');
    schoolSpan.textContent = story.school;
    info.appendChild(schoolSpan);

    author.appendChild(avatar);
    author.appendChild(info);

    card.appendChild(stars);
    card.appendChild(quote);
    card.appendChild(author);

    return card;
  };

  const renderStories = () => {
    if (!cms) return;
    const { data } = cms.loadData();
    const track = document.getElementById('testimonialsTrack');
    if (!track) return;

    const stories = data.stories || [];
    track.innerHTML = '';

    if (stories.length === 0) {
      track.style.animation = 'none';
      const empty = document.createElement('p');
      empty.style.color = 'var(--text-muted)';
      empty.style.padding = '24px';
      empty.textContent = 'No student stories yet. Add stories from admin.html.';
      track.appendChild(empty);
      return;
    }

    // Ensure at least 5 cards per loop half so the marquee fills wide displays seamlessly
    const halfSet = [];
    while (halfSet.length < 5) {
      halfSet.push(...stories);
    }
    const fullTrackList = [...halfSet, ...halfSet];
    fullTrackList.forEach(story => {
      track.appendChild(buildStoryCardElement(story));
    });

    const durationSec = Math.max(26, halfSet.length * 7.5);
    track.style.animation = `scroll-testimonials ${durationSec}s linear infinite`;
  };

  renderStories();

  window.addEventListener('storage', (e) => {
    if (cms && e.key === cms.STORAGE_KEY) {
      renderStories();
    }
  });

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Back to top visibility
    const backToTop = document.getElementById('backToTop');
    if (window.scrollY > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }

    // Active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  // ===== HAMBURGER MENU =====
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinksEl.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    if (navLinksEl.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu when a link is clicked
  navLinksEl.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinksEl.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = '';
        s.style.opacity = '';
      });
    });
  });

  // ===== PARTICLES =====
  const particlesContainer = document.getElementById('particles');
  if (particlesContainer) {
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (6 + Math.random() * 6) + 's';
      particle.style.width = (3 + Math.random() * 4) + 'px';
      particle.style.height = particle.style.width;
      particle.style.opacity = 0.3 + Math.random() * 0.5;
      particlesContainer.appendChild(particle);
    }
  }

  // ===== COUNTER ANIMATION =====
  let countersStarted = false;

  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-num');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'));
      const duration = 2000;
      const step = target / (duration / 16);
      let current = 0;

      const update = () => {
        current += step;
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(update);
        } else {
          counter.textContent = target.toLocaleString();
        }
      };
      update();
    });
  };

  // ===== INTERSECTION OBSERVER — Fade In & Counters =====
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');

        // Trigger counters when hero stats are visible
        if (entry.target.classList.contains('hero-stats') && !countersStarted) {
          countersStarted = true;
          animateCounters();
        }
      }
    });
  }, { threshold: 0.15 });

  // Observe elements for fade-in
  const fadeTargets = [
    '.about-grid', '.service-card', '.dest-card', '.why-card',
    '.process-step', '.testimonials-wrapper', '.showcase-grid',
    '.contact-grid', '.hero-stats', '.eligibility-card', '.faq-item'
  ];

  fadeTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('fade-in');
      el.style.transitionDelay = (i * 0.08) + 's';
      observer.observe(el);
    });
  });

  // Also observe hero stats directly for counter trigger
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) observer.observe(heroStats);

  // ===== DESTINATION FILTERS =====
  const destFilterBtns = document.querySelectorAll('.dest-filter-btn');
  const destCards = document.querySelectorAll('.dest-card');

  destFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      destFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      destCards.forEach(card => {
        const country = card.getAttribute('data-country');
        if (filter === 'all' || country === filter) {
          card.classList.remove('hidden');
          card.style.animation = 'fadeInCard 0.4s ease forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  // ===== ELIGIBILITY ASSESSMENT CALCULATOR =====
  let currentDegree = 'masters';
  let currentCountry = 'uk';
  let currentGrade = 'first';

  const assessMatrix = {
    uk: {
      first: { score: 98, title: 'Outstanding Acceptance & High Scholarship Potential', unis: '22+ Universities', scholarship: 'Up to £10,000 - £15,000', workVisa: '2 Years PSW (Graduate Route)' },
      second_upper: { score: 94, title: 'Direct Admission to Top Russell Group & Partner Unis', unis: '18+ Universities', scholarship: 'Up to £5,000 - £8,000', workVisa: '2 Years PSW (Graduate Route)' },
      second_lower: { score: 86, title: 'Strong Admission Feasibility with Wide Course Options', unis: '12+ Universities', scholarship: 'Up to £3,000 - £5,000', workVisa: '2 Years PSW (Graduate Route)' },
      highschool: { score: 88, title: 'Direct Undergraduate & Foundation Pathway Guaranteed', unis: '15+ Universities', scholarship: 'Early-Bird £2,500 Bursary', workVisa: '2 Years PSW after Degree' }
    },
    canada: {
      first: { score: 96, title: 'Prime Candidate for Top Canadian Institutions & Co-op', unis: '16+ Universities & Colleges', scholarship: 'Up to $8,000 - $12,000 CAD', workVisa: 'Up to 3-Year PGWP' },
      second_upper: { score: 91, title: 'High Admission Likelihood with Post-Grad Work Permit', unis: '14+ Universities & Colleges', scholarship: 'Up to $5,000 CAD', workVisa: 'Up to 3-Year PGWP' },
      second_lower: { score: 82, title: 'Post-Graduate Certificate / Master Pathway Fit', unis: '10+ Institutions', scholarship: 'Bursary Options Available', workVisa: 'Up to 3-Year PGWP' },
      highschool: { score: 89, title: 'Direct Bachelor Admission & College Pathway Eligible', unis: '12+ Institutions', scholarship: 'Entrance Award $3,000 CAD', workVisa: 'Up to 3-Year PGWP' }
    },
    usa: {
      first: { score: 95, title: 'Eligible for Top US Tier-1 & Tier-2 Universities', unis: '20+ Universities', scholarship: 'Up to $15,000 - $25,000 /yr', workVisa: '1 to 3 Years OPT (STEM)' },
      second_upper: { score: 90, title: 'Strong Profile for Accredited US Master Programs', unis: '16+ Universities', scholarship: 'Up to $8,000 - $12,000 /yr', workVisa: '1 to 3 Years OPT (STEM)' },
      second_lower: { score: 80, title: 'Solid Options across Comprehensive US Colleges', unis: '10+ Universities', scholarship: 'Institutional Aid Available', workVisa: '1 to 3 Years OPT (STEM)' },
      highschool: { score: 87, title: 'Undergraduate Freshman Admission with SAT/ACT Waivers', unis: '15+ Universities', scholarship: 'Freshman Merit $6,000 /yr', workVisa: '1 to 3 Years OPT' }
    },
    australia: {
      first: { score: 97, title: 'Fast-Track Admission to Group of Eight & Top Unis', unis: '15+ Universities', scholarship: 'Up to 25% - 50% Tuition Waiver', workVisa: '2 to 4 Years Post-Study Work' },
      second_upper: { score: 92, title: 'Excellent Fit for Leading Australian Universities', unis: '14+ Universities', scholarship: 'Up to $5,000 - $10,000 AUD', workVisa: '2 to 4 Years Post-Study Work' },
      second_lower: { score: 84, title: 'Graduate Diploma & Master Pathway Available', unis: '9+ Universities', scholarship: 'Regional Bursaries Available', workVisa: '2 to 4 Years Post-Study Work' },
      highschool: { score: 90, title: 'Direct Bachelor & Diploma Pathway to Degree', unis: '12+ Universities', scholarship: 'Merit Grant $4,000 AUD', workVisa: '2 to 4 Years Post-Study Work' }
    },
    europe: {
      first: { score: 96, title: 'Eligible for Low/Free Tuition & Erasmus Opportunities', unis: '18+ Top European Institutions', scholarship: 'Low/Zero Tuition in Germany/France', workVisa: '18 Months Job-Seeker Permit' },
      second_upper: { score: 91, title: 'English-Taught Master Admission across Schengen Zone', unis: '15+ Institutions', scholarship: 'Excellence Grants Available', workVisa: '18 Months Job-Seeker Permit' },
      second_lower: { score: 83, title: 'Affordable English-Taught Programs across Europe', unis: '11+ Institutions', scholarship: 'Subsidized Public Tuition', workVisa: '12-18 Months PSW' },
      highschool: { score: 85, title: 'European Foundation & English-Taught Bachelor Fit', unis: '12+ Institutions', scholarship: 'EU Mobility Grants', workVisa: '18 Months Job-Seeker Permit' }
    }
  };

  const updateEligibilityUI = () => {
    const data = (assessMatrix[currentCountry] && assessMatrix[currentCountry][currentGrade]) 
      || assessMatrix.uk.first;
    
    const percentageEl = document.getElementById('matchPercentage');
    const titleEl = document.getElementById('resultTitle');
    const summaryEl = document.getElementById('resultSummary');
    const hlUnis = document.getElementById('hlUnis');
    const hlScholarship = document.getElementById('hlScholarship');
    const hlWorkVisa = document.getElementById('hlWorkVisa');
    const gaugeCircle = document.querySelector('.gauge-circle');

    if (percentageEl) percentageEl.textContent = data.score + '%';
    if (titleEl) titleEl.textContent = data.title;
    if (hlUnis) hlUnis.textContent = data.unis;
    if (hlScholarship) hlScholarship.textContent = data.scholarship;
    if (hlWorkVisa) hlWorkVisa.textContent = data.workVisa;

    if (gaugeCircle) {
      gaugeCircle.style.background = `conic-gradient(var(--gold) 0% ${data.score}%, rgba(255,255,255,0.12) ${data.score}% 100%)`;
    }

    const countryNames = { uk: 'United Kingdom', canada: 'Canada', usa: 'United States', australia: 'Australia', europe: 'Continental Europe' };
    const degreeNames = { masters: "Master's program", bachelors: "Bachelor's degree", phd: 'Doctoral research', foundation: 'Foundation pathway' };
    
    if (summaryEl) {
      summaryEl.textContent = `Based on your academic profile, you qualify for direct consideration for a ${degreeNames[currentDegree] || 'program'} in ${countryNames[currentCountry] || 'your destination'} with high probability of visa approval and funding eligibility.`;
    }
  };

  // Setup button groups
  const setupButtonGroup = (containerId, callback) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    const buttons = container.querySelectorAll('.eval-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        callback(btn);
        updateEligibilityUI();
      });
    });
  };

  setupButtonGroup('degreeOptions', (btn) => { currentDegree = btn.getAttribute('data-degree'); });
  setupButtonGroup('countryOptions', (btn) => { currentCountry = btn.getAttribute('data-country'); });
  setupButtonGroup('gradeOptions', (btn) => { currentGrade = btn.getAttribute('data-grade'); });

  // Claim assessment button -> auto-fill contact form
  const claimAssessmentBtn = document.getElementById('claimAssessmentBtn');
  if (claimAssessmentBtn) {
    claimAssessmentBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const destSelect = document.getElementById('destination');
      if (destSelect && currentCountry) {
        destSelect.value = currentCountry;
      }
      const serviceSelect = document.getElementById('service');
      if (serviceSelect) {
        serviceSelect.value = 'all';
      }
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const navHeight = navbar ? navbar.offsetHeight : 80;
        window.scrollTo({ top: contactSection.offsetTop - navHeight - 16, behavior: 'smooth' });
        setTimeout(() => {
          const fnInput = document.getElementById('firstName');
          if (fnInput) fnInput.focus();
        }, 600);
      }
    });
  }

  // ===== FAQ ACCORDION =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close others
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const navHeight = navbar.offsetHeight;
        const targetPos = target.offsetTop - navHeight - 16;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // ===== BACK TO TOP =====
  const backToTop = document.getElementById('backToTop');
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ===== CONTACT FORM =====
  const contactForm = document.getElementById('contactForm');
  const successToast = document.getElementById('successToast');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const firstName = document.getElementById('firstName').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const destination = document.getElementById('destination').value;

      if (!firstName || !email || !phone || !destination) {
        // Shake empty required fields
        [document.getElementById('firstName'), document.getElementById('email'),
         document.getElementById('phone'), document.getElementById('destination')].forEach(field => {
          if (!field.value.trim()) {
            field.style.borderColor = '#ef4444';
            field.style.animation = 'shake 0.4s ease';
            setTimeout(() => {
              field.style.animation = '';
              field.style.borderColor = '';
            }, 500);
          }
        });
        return;
      }

      // Simulate form submission
      const submitBtn = document.getElementById('submitFormBtn');
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Sending...';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Send Message & Book Consultation';
        contactForm.reset();

        // Show toast
        successToast.classList.add('show');
        setTimeout(() => successToast.classList.remove('show'), 4000);
      }, 1500);
    });
  }

  // ===== SERVICE CARDS HOVER PARALLAX =====
  document.querySelectorAll('.service-card, .why-card, .dest-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
      card.style.transform = `translateY(-8px) rotateX(${-y * 0.4}deg) rotateY(${x * 0.4}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // Dynamic animation keyframe injection
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);

});

