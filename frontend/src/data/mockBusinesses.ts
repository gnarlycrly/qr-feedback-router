// Mock business data for development/demo purposes
// This will be replaced with real API calls when backend is ready

export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    tagline: string;
  };
  reward: {
    title: string;
    description: string;
    promoCode: string;
    validityDays: number;
    terms: string;
  };
}

export const mockBusinesses: Business[] = [
  {
    id: 'bella-vista-123',
    name: 'Bella Vista Restaurant',
    address: '123 Ocean Drive, Miami Beach, FL 33139',
    phone: '+1 (305) 555-0123',
    email: 'info@bellavista.com',
    website: 'https://bellavista.com',
    logo: '🍝',
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#EC4899',
      tagline: 'Authentic Italian Dining Experience',
    },
    reward: {
      title: 'Special Thank You Offer!',
      description: '20% off your next meal',
      promoCode: 'BELLAMKØL',
      validityDays: 30,
      terms: 'Valid for dine-in only. Cannot be combined with other offers. One per customer.',
    },
  },
  {
    id: 'coffee-corner-456',
    name: 'The Coffee Corner',
    address: '456 Main Street, Brooklyn, NY 11201',
    phone: '+1 (718) 555-0456',
    email: 'hello@coffeecorner.com',
    website: 'https://coffeecorner.com',
    logo: '☕',
    branding: {
      primaryColor: '#92400E',
      secondaryColor: '#F59E0B',
      tagline: 'Your Daily Dose of Happiness',
    },
    reward: {
      title: 'Free Coffee on Us!',
      description: 'Get a free medium coffee with any pastry purchase',
      promoCode: 'COFFEE2024',
      validityDays: 14,
      terms: 'Valid Monday-Friday only. Excludes specialty drinks. One per visit.',
    },
  },
  {
    id: 'sushi-zen-789',
    name: 'Sushi Zen',
    address: '789 Cherry Blossom Lane, San Francisco, CA 94102',
    phone: '+1 (415) 555-0789',
    email: 'reservations@sushizen.com',
    website: 'https://sushizen.com',
    logo: '🍣',
    branding: {
      primaryColor: '#DC2626',
      secondaryColor: '#1F2937',
      tagline: 'Traditional Japanese Cuisine',
    },
    reward: {
      title: 'Complimentary Appetizer',
      description: 'Free edamame or miso soup with your next order',
      promoCode: 'ZENREWARD',
      validityDays: 21,
      terms: 'Valid for orders $25 or more. Dine-in and takeout. Expires 3 weeks from issue.',
    },
  },
];

// Helper function to get business by ID
export const getBusinessById = (businessId: string): Business | undefined => {
  return mockBusinesses.find((business) => business.id === businessId);
};

// Default business (fallback)
export const defaultBusiness = mockBusinesses[0];
