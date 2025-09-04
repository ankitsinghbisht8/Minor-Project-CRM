# CRM Landing Page

A modern, responsive CRM landing page built with React.js and Tailwind CSS, inspired by leading SaaS websites like Zixflow, HubSpot, and Salesforce.

## Features

### 🎨 Design & UI
- Clean, minimal design with professional color palette
- Responsive design for desktop, tablet, and mobile
- Smooth animations powered by Framer Motion
- Custom gradients and modern card layouts
- Professional typography using Inter font

### 📱 Sections Included

1. **Header Navigation**
   - Fixed navigation with blur effect
   - Mobile-responsive hamburger menu
   - CTAs for Login and Create Account

2. **Hero Section**
   - Bold headline: "The Only CRM You'll Ever Need"
   - Compelling subtext about centralization and automation
   - Primary and secondary CTAs
   - Interactive CRM dashboard mockup with floating success indicator

3. **Trusted By Section**
   - Company logos (Axis Bank, TCS, Blackstone, etc.)
   - Animated logo carousel
   - Social proof with "5,000+ companies worldwide"

4. **Features Section**
   - 4 key feature highlights with icons:
     - 🚀 AI-Powered Outreach
     - 📊 Seamless Sales Pipelines  
     - 📱 Multi-Channel Engagement
     - 📈 Analytics & Insights
   - Interactive "How it works" section
   - Step-by-step process visualization

5. **Product Preview**
   - Tabbed interface showing different CRM modules
   - Detailed Sales Deals Kanban board mockup
   - Campaign manager preview
   - Interactive tab switching

6. **Testimonials Carousel**
   - Customer testimonials from real companies
   - Auto-rotating carousel with manual controls
   - Company branding and case study links
   - "Call in Action" dashboard preview

7. **Call to Action**
   - Prominent CTA banner with gradient background
   - Trust indicators (free trial, no credit card, etc.)
   - Feature highlights and statistics
   - Multiple conversion opportunities

8. **Footer**
   - Comprehensive link structure
   - Newsletter signup
   - Social media links
   - Floating CTA button

### 🛠 Technical Implementation

- **React.js** - Component-based architecture
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Responsive Design** - Mobile-first approach
- **Modern JavaScript** - ES6+ features and hooks

### 🎯 Animations

- Fade-in animations on scroll
- Hover effects on interactive elements
- Page load animations
- Carousel transitions
- Button hover states and micro-interactions

### 📁 Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation component
│   ├── Hero.jsx            # Hero section with CTA
│   ├── TrustedBy.jsx       # Company logos section
│   ├── Features.jsx        # Feature highlights
│   ├── ProductPreview.jsx  # Tabbed product showcase
│   ├── Testimonials.jsx    # Customer testimonials
│   ├── CallToAction.jsx    # Final CTA section
│   ├── Footer.jsx          # Footer with links
│   ├── LandingPage.jsx     # Main page component
│   └── index.js            # Component exports
├── App.js                  # Main app component
├── index.css              # Global styles + Tailwind
└── App.css                # App-specific styles
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Dependencies

```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "framer-motion": "latest",
  "tailwindcss": "latest",
  "postcss": "latest",
  "autoprefixer": "latest"
}
```

## Customization

### Colors
The color palette can be customized in `tailwind.config.js`:
- Primary: Yellow/Orange gradient
- Secondary: Purple tones
- Accent: Teal/Green
- Neutral: Gray scale

### Content
All text content, company names, and testimonials can be easily modified in the respective component files.

### Layout
The responsive breakpoints and layout can be adjusted using Tailwind's responsive utilities.

## Performance

- Optimized animations with `will-change` properties
- Lazy loading of images
- Efficient React component structure
- Minimal bundle size with Tailwind CSS purging

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## License

This project is for demonstration purposes. Feel free to use and modify as needed.