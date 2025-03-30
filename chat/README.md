# AI Doctor Chat

A chat application built with Next.js and shadcn/ui where users can chat with AI doctors powered by Claude Anthropic models.

## Features

- List of AI doctors with different specialties
- Resizable chat interface
- Persistent chat sessions with each doctor
- Integration with Claude Anthropic models (simulated in this demo)
- Modern UI built with shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. Select a doctor from the list on the left side
2. Type a message in the input field and send it
3. View the doctor's response in the chat window

## Integration with Anthropic API

The current implementation uses a simulated API response. To integrate with the actual Anthropic API:

1. Get an API key from Anthropic
2. Update the `api.ts` file with actual API calls
3. Add proper error handling and rate limiting

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Radix UI
- Claude Anthropic Models (simulated)

## License

This project is licensed under the MIT License.