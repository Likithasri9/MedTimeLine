# MedTimeLine – Your Health Hub

DEMO VIDEO  - https://youtu.be/Nx3hgetcyqA?si=M--y0ol6ZSsg34F-

**MedTimeLine** is a medical record management web application that helps users organize their health information in one place. It brings together medical records, prescriptions, medications, allergies, and health conditions in a simple, easy-to-navigate interface.

The application is designed to help users maintain their medical history, share selected information with trusted doctors, and access important health details when needed.

## Key Features

- **Dashboard:** Provides a central place to access health information.
- **Medical Records:** Organizes medical documents, reports, prescriptions, and discharge summaries.
- **Document Upload:** Allows users to upload medical records in supported file formats, including PDFs.
- **Medication Management:** Helps users keep track of their medications and prescriptions.
- **Allergy Management:** Organizes information about known allergies.
- **Health Conditions:** Keeps relevant medical conditions accessible in one place.
- **Secure Sharing:** Supports the concept of sharing selected medical information through time-limited access.
- **Emergency View:** Provides quick access to important medical information.
- **Safety Checks:** Aims to highlight potentially overlapping prescriptions and reminders for repeat tests.

## Technology Stack

| Technology | Purpose |
|---|---|
| Next.js | Application framework and routing |
| React | User interface development |
| TypeScript | Type-safe application development |
| Tailwind CSS | Styling and responsive layouts |
| Neon Serverless PostgreSQL | Database connectivity and storage |
| Zod | Data validation |
| Lucide React | Icons and interface elements |
| Recharts | Charts and data visualization |
| QRCode | QR code generation |
| Anthropic SDK | AI integration capabilities |

## Project Implementation

### 1. Frontend Development
The frontend is built using Next.js and React. It provides a sidebar for navigating between the dashboard, medical records, medications, allergies, conditions, shared access, and emergency view.

### 2. Backend and Database
The application uses Next.js to support its application logic and server-side functionality. Neon Serverless PostgreSQL provides database connectivity for storing and retrieving supported application data.

### 3. Medical Document Management
Users can upload medical documents to organize their health history. The intended workflow brings relevant information from medical documents into a unified view. Extracted information should be reviewed and confirmed by the user.

### 4. Health Information Sharing
The application is designed around controlled access to medical information. Users should be able to share only the information needed for a particular purpose, with appropriate access expiration and revocation controls.

### 5. Emergency Access
The emergency view is designed to make important medical details easier to find when they are needed quickly.

## Getting Started

### Prerequisites

- Node.js and npm
- Git
- A Neon PostgreSQL database
- An environment configuration for the services used by the application

### Installation

Clone the repository:

git clone https://github.com/Likithasri9/MedTimeLine.git

Move into the project directory:

cd MedTimeLine

Install the dependencies:

npm install

### Environment Configuration

Create a `.env.local` file in the project root and configure the database connection:


DATABASE_URL=your_neon_database_connection_string


If an AI-powered feature requires an Anthropic API key, configure it using the environment variable expected by that feature. Never commit API keys, database passwords, or other secrets to GitHub.

### Run the Application

Start the development server:

npm run dev

Open the application in your browser:

http://localhost:3000

### Build for Production

To create a production build, run:

npm run build

To start the production server after a successful build:

npm run start

## Project Goals

- Maintain medical information in one organized location.
- Make medical records easier to access and review.
- Support controlled sharing of health information.
- Improve access to important medical details during emergencies.
- Help users identify information that may require further review by a healthcare professional.

## Important Disclaimer

MedTimeLine is a medical record organization tool, not a diagnostic system. It does not replace professional medical advice. Medication warnings, extracted document information, and other health-related details must be verified before being relied upon.

The security of medical information depends on the correct implementation and testing of authentication, authorization, database access controls, and sharing permissions.

## Repository

GitHub: https://github.com/Likithasri9/MedTimeLine

## License

Refer to the repository's license information for the applicable terms of use.
