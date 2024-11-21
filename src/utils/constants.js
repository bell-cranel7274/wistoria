export const CATEGORIES = [
  'General',
  'Work',
  'Personal',
  'Shopping',
  'Health',
  'Education',
  'Finance'
];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];
export const STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];

export const PRIORITY_COLORS = {
  HIGH: 'text-[#D72638]',    // Deep Red
  MEDIUM: 'text-[#FCD307]',  // Bright Yellow
  LOW: 'text-[#64FFDA]'      // Neon Green
};

export const STATUS_COLORS = {
  PENDING: 'text-[#FCD307]',  // Bright Yellow
  IN_PROGRESS: 'text-[#4A90E2]', // Steel Blue
  COMPLETED: 'text-[#64FFDA]'    // Neon Green
};

export const PRIORITY_BG_COLORS = {
  HIGH: 'bg-[#D72638]/10',
  MEDIUM: 'bg-[#FCD307]/10',
  LOW: 'bg-[#64FFDA]/10'
};

export const STATUS_BG_COLORS = {
  PENDING: 'bg-[#FCD307]/10',
  IN_PROGRESS: 'bg-[#4A90E2]/10',
  COMPLETED: 'bg-[#64FFDA]/10'
};

// Progress colors
export const PROGRESS_COLORS = {
  LOW: '#D72638',     // Deep Red for low progress
  MEDIUM: '#FCD307',  // Bright Yellow for medium progress
  HIGH: '#64FFDA'     // Neon Green for high progress
}; 