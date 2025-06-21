import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the schema file
    const schemaPath = path.join(process.cwd(), 'src', 'jupiter-mcp', 'jupiter-api-schema.json');
    
    // Read the file
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Parse the JSON to validate it
    const schemaJson = JSON.parse(schemaContent);
    
    // Return the schema as JSON with appropriate headers
    return NextResponse.json(schemaJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="jupiter-api-schema.json"'
      }
    });
  } catch (error) {
    console.error('Error serving MCP schema:', error);
    return NextResponse.json(
      { error: 'Failed to load MCP schema' },
      { status: 500 }
    );
  }
} 