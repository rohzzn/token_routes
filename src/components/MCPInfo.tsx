"use client";

import React from 'react';

const MCPInfo: React.FC = () => {
  return (
    <div className="h-full overflow-auto">
      <div className="mb-6">
        <p className="text-slate-300 mb-4">
          This application includes a comprehensive Machine Context Prompt (MCP) for Jupiter APIs. 
          The MCP is a structured JSON file that provides AI tools like Claude with detailed information 
          about Jupiter&apos;s APIs, including endpoints, parameters, responses, and best practices.
        </p>
        <p className="text-slate-300 mb-4">
          The MCP is located at <code className="bg-slate-800 px-2 py-1 rounded">src/jupiter-mcp/jupiter-api-schema.json</code> and 
          can be imported into AI tools to enhance their understanding of Jupiter&apos;s APIs.
        </p>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">MCP Features:</h4>
        <ul className="list-disc pl-6 space-y-2 text-slate-300">
          <li>Comprehensive API documentation for Swap, Token, Shield, and Price APIs</li>
          <li>Detailed parameter descriptions and response formats</li>
          <li>Common usage patterns and workflows</li>
          <li>Best practices for error handling and transaction submission</li>
          <li>Common errors and troubleshooting solutions</li>
        </ul>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">APIs Covered:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h5 className="font-medium text-indigo-400 mb-2">Swap API</h5>
            <p className="text-sm text-slate-300">
              Endpoints for getting quotes, building swap transactions, and executing swaps between tokens on Solana.
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h5 className="font-medium text-indigo-400 mb-2">Token API</h5>
            <p className="text-sm text-slate-300">
              Information about tokens, verification status, market data, and token metadata.
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h5 className="font-medium text-indigo-400 mb-2">Shield API</h5>
            <p className="text-sm text-slate-300">
              Token safety information and warnings to help users avoid scams and risky tokens.
            </p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h5 className="font-medium text-indigo-400 mb-2">Price API</h5>
            <p className="text-sm text-slate-300">
              Token price information and historical data for analysis and display.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">How to Use:</h4>
        <ol className="list-decimal pl-6 space-y-2 text-slate-300">
          <li>Download the JSON schema file from the application</li>
          <li>Import it into Claude AI via Cursor or other compatible tools</li>
          <li>The AI will now have enhanced knowledge about Jupiter&apos;s APIs</li>
          <li>Ask questions or request code samples related to Jupiter integration</li>
        </ol>
      </div>
      
      <div className="mb-6">
        <h4 className="text-md font-semibold mb-2">Example Queries:</h4>
        <div className="bg-slate-800/50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-slate-300">
            <span className="text-indigo-400">→</span> How do I get a quote for swapping SOL to USDC using Jupiter&apos;s API?
          </p>
          <p className="text-sm text-slate-300">
            <span className="text-indigo-400">→</span> What are the best practices for handling slippage in Jupiter swaps?
          </p>
          <p className="text-sm text-slate-300">
            <span className="text-indigo-400">→</span> Show me a complete code example for executing a swap with Jupiter
          </p>
          <p className="text-sm text-slate-300">
            <span className="text-indigo-400">→</span> How can I check if a token is safe before trading it?
          </p>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <a 
          href="/api/mcp" 
          download="jupiter-api-schema.json"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Download MCP Schema
        </a>
      </div>
    </div>
  );
};

export default MCPInfo; 