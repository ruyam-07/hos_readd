# Hospital Readmission ML Prediction Interface

A comprehensive React-based user interface for hospital readmission prediction using machine learning. This interface provides healthcare professionals with an intuitive way to assess patient readmission risk through a 55-field medical form and real-time ML predictions.

## Features

### 🏥 Multi-Step Medical Form
- **55-field comprehensive assessment** across 4 categories:
  - Patient Demographics (age, gender, race, insurance, etc.)
  - Medical History (diagnoses, medications, allergies, procedures)
  - Current Admission (type, department, length of stay, complications)
  - Clinical Measures (vital signs, lab values, functional assessments)

### 🎯 Real-Time Risk Assessment
- **Live prediction updates** as form data is entered
- **Auto-save functionality** to prevent data loss
- **Field validation** with medical range checking
- **Medical code lookup** for standardized entries

### 📊 Interactive Visualizations
- **Animated Risk Gauge** (0-100% risk score)
- **Feature Importance Chart** showing ML model decision factors
- **Confidence Interval Display** with statistical analysis
- **Clinical Recommendations** with priority-based filtering

### 🎨 Modern Design
- **Glass morphism** aesthetic with neon accents
- **Smooth animations** powered by Framer Motion
- **Responsive layout** optimized for all devices
- **Dark theme** optimized for clinical environments

## Components

### 1. PredictionForm
Multi-step form with progress tracking and validation.

```tsx
<PredictionForm onPredictionComplete={handleResult} />
```

**Features:**
- 4-step form progression
- Real-time validation
- Auto-save functionality
- Patient data import
- Medical code suggestions

### 2. RiskGauge
Animated circular gauge displaying risk percentage.

```tsx
<RiskGauge 
  riskScore={0.75} 
  riskLevel="high" 
  confidence={0.95} 
  isLoading={false} 
/>
```

**Features:**
- Animated needle and progress arc
- Color-coded risk levels (Low/Medium/High)
- Confidence indicator
- Real-time updates

### 3. FeatureImportance
Interactive bar chart showing ML feature contributions.

```tsx
<FeatureImportance 
  features={importanceData} 
  showTop={10} 
  isLoading={false} 
/>
```

**Features:**
- Interactive bar chart (Recharts)
- Feature filtering and sorting
- Detailed explanations
- Category-based coloring

### 4. RecommendationCards
Priority-based clinical recommendations.

```tsx
<RecommendationCards 
  recommendations={clinicalRecs} 
  isLoading={false} 
/>
```

**Features:**
- Priority filtering (High/Medium/Low)
- Category filtering (Medication/Monitoring/Intervention/Discharge)
- Expandable cards with detailed rationale
- Action buttons for workflow integration

### 5. ConfidenceInterval
Statistical confidence visualization.

```tsx
<ConfidenceInterval 
  lower={0.65} 
  upper={0.85} 
  confidence={0.95} 
  prediction={0.75} 
/>
```

**Features:**
- Visual confidence band
- Statistical interpretation
- Precision indicators
- Interactive tooltips

## Technology Stack

- **React 18** with TypeScript
- **React Hook Form** for form management
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Tailwind CSS** for styling
- **Lucide React** for icons

## Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm start
```

3. **Build for production:**
```bash
npm run build
```

## Configuration

### Environment Variables
Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

### Tailwind Configuration
Custom glass morphism and neon accent utilities are pre-configured in `tailwind.config.js`.

## Form Structure

### Step 1: Demographics
- Age, gender, race, ethnicity
- Language, insurance type
- Marital status, employment
- Religion, social factors

### Step 2: Medical History
- Primary and secondary diagnoses
- Comorbidities and chronic conditions
- Previous admissions count
- Current medications and allergies
- Surgical and family history
- Social history (smoking, alcohol, drugs)

### Step 3: Current Admission
- Admission type and source
- Department and attending physician
- Length of stay
- Procedures performed
- Complications during stay
- Discharge disposition

### Step 4: Clinical Measures
- **Vital Signs:** temperature, heart rate, blood pressure, respiratory rate, oxygen saturation
- **Lab Values:** hemoglobin, hematocrit, electrolytes, glucose, kidney function, liver function
- **Functional Status:** mobility, cognitive, and ADL scores

## Data Validation

### Real-time Validation
- **Range checking** for vital signs and lab values
- **Medical code validation** for ICD-10, CPT, SNOMED
- **Cross-field validation** (e.g., systolic vs diastolic BP)
- **Required field enforcement**

### Normal Range Indicators
Visual indicators show when values are:
- ✅ **Normal range** (green)
- ⚠️ **Abnormal but acceptable** (yellow)
- ❌ **Critical values** (red)

## API Integration

The frontend connects to the FastAPI backend for:
- **Prediction generation** (`POST /api/v1/predictions/`)
- **Real-time risk assessment** (`POST /api/v1/predictions/risk-preview`)
- **Form validation** (`POST /api/v1/predictions/validate`)
- **Medical code lookup** (`GET /api/v1/medical-codes/search`)
- **Patient data import** (`GET /api/v1/patients/{id}/import`)

## Customization

### Adding New Form Fields
1. Update `types/index.ts` with new field definitions
2. Add validation rules in `utils/validation.ts`
3. Create/update form step components
4. Update the form hook in `hooks/usePredictionForm.ts`

### Styling Customization
- Modify `tailwind.config.js` for theme changes
- Update `index.css` for global styles
- Use CSS variables for dynamic theming

### Animation Customization
- Modify Framer Motion variants in components
- Add new animations in `tailwind.config.js`
- Update timing and easing functions

## Performance Optimization

- **Code splitting** with React.lazy()
- **Memoization** for expensive calculations
- **Virtualization** for large data sets
- **Debounced** auto-save and real-time updates
- **Optimized** chart rendering

## Browser Support

- Chrome 80+
- Firefox 78+
- Safari 14+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Refer to the API documentation

---

**Note:** This is a demo interface. Ensure proper validation, security, and compliance before using in production healthcare environments.