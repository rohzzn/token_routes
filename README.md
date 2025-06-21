# 🪐 Jupiter Router 

Welcome to Jupiter Router  - an advanced visualization and analytics tool for exploring swap routes on Jupiter, Solana's leading liquidity aggregator.

## Overview

Jupiter Router  is a comprehensive tool that helps traders, developers, and liquidity providers visualize, analyze, and optimize token swaps on Solana. By providing deep insights into routing paths, price impact, and execution efficiency, this tool enables users to make better-informed trading decisions.

## Key Features

### 🔄 Interactive Route Visualization
- **Multi-route Comparison**: Compare up to 3 different routes side-by-side
- **Protocol Identification**: See which protocols (Orca, Raydium, etc.) are being used in each hop
- **Price Impact Analysis**: Visual indicators for price impact at each step
- **Animated Token Flow**: Follow the path your tokens take through the DEX ecosystem

### 📊 Advanced Route Analytics
- **Route Statistics**: View metrics on available routes, best/worst rates, and price impact
- **Protocol Usage Breakdown**: See which DEXs handle the most volume for your specific pairs
- **Route Complexity Analysis**: Understand how hop count affects execution and slippage
- **Smart Insights**: Get AI-powered recommendations for optimal trading strategies

### 💱 Enhanced Swap Functionality
- **Slippage Control**: Set custom slippage parameters
- **Transaction Details**: See comprehensive breakdown of fees and price impact
- **High Impact Warnings**: Get alerts for swaps that might significantly move markets
- **Direct TX Linking**: Track your swaps on chain with Explorer links

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/jupiter-router-explorer.git
cd jupiter-router-explorer
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to see the application

## How It Works

Jupiter Router  leverages Jupiter's Quote API to fetch and visualize optimal routes between tokens. It then presents this data in an intuitive, interactive interface that allows users to:

1. Select input and output tokens
2. View potential routing paths through various liquidity pools
3. Compare efficiency metrics between different routes
4. Execute swaps directly through Jupiter's Swap API

## Architecture

- **Next.js**: React framework for the frontend
- **Tailwind CSS**: For styling
- **ReactFlow**: For interactive route visualization
- **Jupiter API**: For route quotation and swap execution
- **Solana Web3.js**: For blockchain interaction

## Future Enhancements

- [ ] Historical Price Impact Analysis
- [ ] Route Optimization Recommendations
- [ ] MEV Protection Visualization
- [ ] Market Depth Charts
- [ ] Real-time Market Activity Indicators

## Contact

For any questions, feedback or collaboration opportunities, please reach out to us at:
- Twitter: [@YourTwitterHandle](https://twitter.com/yourtwitterhandle)
- Discord: YourDiscordHandle#1234

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for the Jupiter Ecosystem during Namaste Jupiverse - Hackathon Edition.

# Jupiter Route Visualizer with MCP Implementation

This application provides a comprehensive visualization of Jupiter swap routes on Solana, along with a Machine Context Prompt (MCP) implementation for Jupiter APIs.

## Features

### Route Visualization
- Interactive visualization of Jupiter swap routes
- Detailed route analytics and metrics
- Support for multiple routing strategies
- Price impact and slippage analysis

### Machine Context Prompt (MCP) Implementation
The application includes a comprehensive MCP for Jupiter APIs that can be imported into AI tools like Claude via Cursor. The MCP provides:

- Detailed documentation of Jupiter API endpoints, parameters, and responses
- Common usage patterns and workflows
- Best practices for error handling and transaction submission
- Troubleshooting guides for common errors

## MCP Structure

The MCP is implemented as a JSON schema file located at `src/jupiter-mcp/jupiter-api-schema.json`. It covers:

1. **Swap API** - Endpoints for getting quotes, building swap transactions, and executing swaps
2. **Token API** - Information about tokens, verification status, and market data
3. **Shield API** - Token safety information and warnings
4. **Price API** - Token price information

## How to Use the MCP

1. Download the MCP schema from the application's MCP tab
2. Import it into Claude AI via Cursor or other compatible tools
3. The AI will now have enhanced knowledge about Jupiter's APIs
4. Ask questions or request code samples related to Jupiter integration

Example queries you can ask Claude after importing the MCP:
- "How do I get a quote for swapping SOL to USDC using Jupiter's API?"
- "What are the best practices for handling slippage in Jupiter swaps?"
- "Show me a complete code example for executing a swap with Jupiter"
- "How can I check if a token is safe before trading it?"

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
