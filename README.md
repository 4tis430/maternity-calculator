# Maternity Calculator

A comprehensive Israeli maternity leave calculator and planning tool built with Next.js, designed to help expecting parents plan their maternity leave, track pregnancy progress, and prepare for their baby's arrival.

## Features

### 🗓️ Leave Planning
- **Flexible Leave Options**: Choose between Standard (15 weeks), Extended (26 weeks), or Full Year (35 weeks) maternity leave
- **Visual Timeline**: Interactive timeline showing your leave period with Israeli holidays
- **Smart Calculations**: Automatically calculates leave start date (1 week before due date) and return date

### 👶 Pregnancy Tracking
- **Progress Visualization**: Track your 40-week pregnancy journey with visual progress indicators
- **Countdown Timer**: See how many days until your due date
- **Weekly Tips**: Get helpful advice tailored to each week of pregnancy

### ✅ Baby Preparation
- **Comprehensive Checklist**: Organized baby gear checklist covering essentials, nursery, feeding, clothing, and more
- **Cloud Sync**: Your checklist and preferences sync across devices when logged in
- **Progress Tracking**: See your preparation progress at a glance

### 🎨 Personalization
- **Gender Themes**: Switch between boy and girl themes with custom color schemes
- **Dark/Light Mode**: Full theme support for comfortable viewing
- **Hebrew & English**: Bilingual interface supporting both languages

### 📤 Sharing & Export
- **WhatsApp Integration**: Share your leave plan directly to WhatsApp
- **PDF Export**: Generate and download a PDF summary of your leave plan
- **Cloud Storage**: Save your data with Supabase authentication

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Date Handling**: date-fns
- **Charts**: Recharts
- **PDF Generation**: jsPDF + html2canvas
- **Testing**: Playwright
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (for authentication and data storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/4tis430/maternity-calculator.git
cd maternity-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI
- `npm run test:e2e:report` - Show Playwright test report

## Project Structure

```
maternity-calculator/
├── app/                    # Next.js app directory
│   ├── actions/           # Server actions
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── baby-checklist.tsx
│   ├── date-picker.tsx
│   ├── leave-timeline.tsx
│   ├── pdf-export.tsx
│   ├── pregnancy-progress.tsx
│   ├── theme-toggle.tsx
│   └── weekly-tip.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── public/               # Static assets
├── src/                  # Additional source files
├── tests/                # Playwright tests
└── styles/               # Additional styles
```

## Features in Detail

### Israeli Maternity Leave Information

The calculator is specifically designed for Israeli maternity leave regulations:
- **Standard Leave**: 15 weeks of paid leave from Bituach Leumi (National Insurance)
- **Extended Options**: Ability to plan for 6-month or 8-month leave periods
- **Holiday Integration**: Automatically fetches and displays Israeli holidays during your leave period
- **Start Date**: Assumes leave begins 1 week before the due date (common practice in Israel)

### Data Persistence

- **Local Storage**: For non-authenticated users, data is stored locally in the browser
- **Cloud Sync**: Authenticated users have their data synced to Supabase
- **Real-time Updates**: Changes are automatically saved and synced

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For issues or questions, please open an issue on the GitHub repository.

## Acknowledgments

- Built with ❤️ for expecting parents in Israel
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

**Note**: This calculator provides estimates based on Israeli maternity leave regulations. Always consult with your employer and Bituach Leumi for official information regarding your specific situation.
