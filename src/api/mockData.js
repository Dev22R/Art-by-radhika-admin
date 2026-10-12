// Realistic initial dataset for Noor Mehndi Arts Admin Studio

export const INITIAL_USERS = [];

export const INITIAL_DESIGNS = [];

export const INITIAL_PRICING_PLANS = [
  {
    id: 'plan_1',
    name: 'The Royal Maharani Bridal',
    tagline: 'Full bespoke heirloom bridal experience',
    price: 45000,
    duration: 'Full Day Coverage',
    isPopular: true,
    status: 'Active',
    features: [
      'Full Bridal Hands (Elbow Length - Front & Back)',
      'Bridal Feet & Legs (Mid-Calf Coverage)',
      'Custom Groom Portrait & Wedding Hashtag/Date',
      '100% Organic Triple-Filtered Rajasthani Henna Cones',
      'Complimentary Bridal Trial Session (1 Hand)',
      'Aftercare Kit with Premium Henna Balm & Sealant Spray',
      'Complimentary Mehndi for Mother of the Bride (2 Palms)'
    ],
    depositPercent: 30,
    bookingWindow: 'Book 3-6 Months in Advance'
  },
  {
    id: 'plan_2',
    name: 'The Royal Engagement & Sangeet',
    tagline: 'Ideal for Roka, Engagement & Pre-Wedding festivities',
    price: 22000,
    duration: '3 - 4 Hours',
    isPopular: false,
    status: 'Active',
    features: [
      'Forearm Length Intricate Indo-Arabic Design (Both Hands)',
      'Delicate Feet & Ankle Floral Belts',
      'Organic Herbal Cones with Deep Mahogany Stain Guarantee',
      'Pre-care and After-care Consultation',
      'Express Quick-Drying Sealant Application'
    ],
    depositPercent: 25,
    bookingWindow: 'Book 1-2 Months in Advance'
  },
  {
    id: 'plan_3',
    name: 'Sangeet Party & Guest Lounge',
    tagline: 'Dedicated artist duo for bridesmaid & family squad',
    price: 32000,
    duration: '5 Hours (Up to 25 Guests)',
    isPopular: false,
    status: 'Active',
    features: [
      '2 Lead Professional Artists on Venue',
      'Front Palm or Back Hand Design for up to 25 Guests',
      'Curated Lookbook Menu for Fast Guest Selection',
      'Non-toxic Safe Henna Cones for All Skin Types',
      'Extra Artist available at ₹6,000 / artist'
    ],
    depositPercent: 20,
    bookingWindow: 'Book 2-4 Weeks in Advance'
  },
  {
    id: 'plan_4',
    name: 'Destination Wedding Elite Escort',
    tagline: 'Artist travels to your global dream venue',
    price: 85000,
    duration: '2 Days Multi-Event Coverage',
    isPopular: false,
    status: 'Active',
    features: [
      'Complete Multi-Day Bridal Henna Ceremonies',
      'VIP Family Member Styling included',
      'Premium Organic Freshly Brewed Henna Cones flown in',
      'Full post-mehndi dark stain photo-readiness assist',
      'Travel & Accommodation charged separately'
    ],
    depositPercent: 50,
    bookingWindow: 'Book 4-8 Months in Advance'
  }
];

export const INITIAL_REELS = [];

export const INITIAL_ENQUIRIES = [
  {
    id: 'enq_101',
    clientName: 'Ishita Singhania',
    phone: '+91 98111 22334',
    email: 'ishita.singh@gmail.com',
    eventType: 'Bridal Wedding',
    packageInterest: 'The Royal Maharani Bridal',
    eventDate: '2026-11-24',
    venue: 'The Leela Palace, Udaipur',
    budget: '₹45,000 - ₹55,000',
    guestCount: '15 Guests',
    message: 'Hello Noor! I am getting married in Udaipur this November. I want full Rajasthani figures and would love to schedule a bridal trial next week in Delhi.',
    status: 'New',
    createdAt: '2026-10-09T10:15:00Z',
    urgency: 'High',
    internalNotes: 'VIP client, wedding planner connected. Follow up via WhatsApp asap.'
  },
  {
    id: 'enq_102',
    clientName: 'Dr. Meera Agarwal',
    phone: '+91 97222 33445',
    email: 'meera.agarwal@outlook.com',
    eventType: 'Sangeet Party',
    packageInterest: 'Sangeet Party & Guest Lounge',
    eventDate: '2026-12-10',
    venue: 'Taj West End, Bangalore',
    budget: '₹35,000',
    guestCount: '30 Guests',
    message: 'We need 2 or 3 artists for a 4-hour Sangeet evening. Please share availability and travel terms.',
    status: 'In Review',
    createdAt: '2026-10-08T14:20:00Z',
    urgency: 'Medium',
    internalNotes: 'Flight charges to be added in quotation.'
  },
  {
    id: 'enq_103',
    clientName: 'Ananya Verma',
    phone: '+91 99333 44556',
    email: 'ananya.v@yahoo.com',
    eventType: 'Engagement & Roka',
    packageInterest: 'The Royal Engagement & Sangeet',
    eventDate: '2026-10-28',
    venue: 'ITC Rajputana, Jaipur',
    budget: '₹22,000',
    guestCount: '5 Guests',
    message: 'Looking for modern Arabic design for my engagement night. Looking forward to your confirmation.',
    status: 'Confirmed',
    createdAt: '2026-10-05T09:00:00Z',
    urgency: 'High',
    internalNotes: 'Advance payment of ₹6,600 received via UPI.'
  },
  {
    id: 'enq_104',
    clientName: 'Kavita Chawla',
    phone: '+91 98444 55667',
    email: 'kavita.c@gmail.com',
    eventType: 'Bridal Wedding',
    packageInterest: 'The Royal Maharani Bridal',
    eventDate: '2026-12-18',
    venue: 'Fairmont, Jaipur',
    budget: '₹50,000',
    guestCount: '10 Guests',
    message: 'Please send your bridal lookbook with prices and booking contract.',
    status: 'Completed',
    createdAt: '2026-09-25T11:40:00Z',
    urgency: 'Low',
    internalNotes: 'Booked and finalized with contract.'
  },
  {
    id: 'enq_105',
    clientName: 'Pooja Bhatt',
    phone: '+91 97555 66778',
    email: 'pooja.bhatt@gmail.com',
    eventType: 'Festive Karwa Chauth',
    packageInterest: 'Custom Artist Hour',
    eventDate: '2026-10-18',
    venue: 'Studio Visit (Jaipur)',
    budget: '₹5,000',
    guestCount: '2 Guests',
    message: 'Need slot for Karwa Chauth back-hand mehndi.',
    status: 'Cancelled',
    createdAt: '2026-10-01T16:10:00Z',
    urgency: 'Low',
    internalNotes: 'Client shifted dates, slot cancelled.'
  }
];

export const INITIAL_FAQS = [
  {
    id: 'faq_1',
    category: 'Booking & Advance',
    question: 'How far in advance should a bride book her wedding Mehndi?',
    answer: 'We recommend booking 3 to 6 months in advance, especially during the peak wedding season (October to March). A 30% advance deposit secures your wedding date on our master calendar.',
    status: 'Published',
    order: 1
  },
  {
    id: 'faq_2',
    category: 'Henna & Skin Care',
    question: 'Are the henna cones 100% natural and safe for sensitive skin?',
    answer: 'Absolutely yes. We handcraft our cones using 100% organic Sojat Rajasthani henna powder, eucalyptus essential oil, tea tree oil, and organic lemon juice. No chemical dyes, PPD, or synthetic color enhancers are ever used.',
    status: 'Published',
    order: 2
  },
  {
    id: 'faq_3',
    category: 'Stain Tips & Aftercare',
    question: 'How do I ensure the darkest possible stain on my wedding day?',
    answer: 'Leave the dry henna paste on for at least 6-8 hours (preferably overnight). Do NOT wash off with water; scrape it gently with oil. Apply clove smoke (laung bhaap) and our complimentary Nilgiri balm. Keep warm and avoid washing hands with soap for the first 24 hours.',
    status: 'Published',
    order: 3
  },
  {
    id: 'faq_4',
    category: 'Travel & Destination',
    question: 'Do you travel outstation and for destination weddings?',
    answer: 'Yes, our team travels pan-India and globally for destination weddings. Flight/train travel, local transfers, and venue accommodation are provided by the client.',
    status: 'Published',
    order: 4
  },
  {
    id: 'faq_5',
    category: 'Bridal Trial',
    question: 'Can I request a bridal trial session before finalizing the booking?',
    answer: 'Yes, we offer paid trial sessions at our studio where you can test the henna paste stain and discuss custom motifs like bridal portraits, love story elements, and sacred verses.',
    status: 'Published',
    order: 5
  }
];

export const STUDIO_PROFILE = {
  artistName: 'Art By Radhika Team',
  title: 'Master Celebrity & Bridal Henna Artist',
  studioName: 'Art By Radhika Studio',
  email: 'admin@artbyradhika.com',
  phone: '+91 99999 99999',
  whatsapp: '+919999999999',
  address: 'Heritage Arts Complex, Jaipur & Delhi NCR',
  currency: 'INR (₹)',
  instagram: '@artbyradhika',
  youtube: 'ArtByRadhikaStudio',
  bio: 'Award-winning bridal henna artist styling royalty, celebrities, and global brides with bespoke botanical storytelling mehndi.',
  workingHours: '10:00 AM - 08:00 PM (IST)'
};
