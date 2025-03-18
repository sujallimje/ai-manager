// pages/api/extract-document.js
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import * as formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let savedFilePath = null;
  let tempFilePath = null;

  try {
    // Parse the form data
    const form = formidable.default();
    form.uploadDir = path.join(process.cwd(), 'tmp');
    form.keepExtensions = true;
    
    // Create upload directory if it doesn't exist
    if (!fs.existsSync(form.uploadDir)) {
      fs.mkdirSync(form.uploadDir, { recursive: true });
    }

    const [fields, files] = await form.parse(req);

    if (!fields.documentType || !files.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const documentType = fields.documentType[0];
    const file = files.file[0];
    tempFilePath = file.filepath;
    
    // Generate a unique filename
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalFilename)}`;
    savedFilePath = path.join(form.uploadDir, uniqueFilename);
    
    // Save file with unique name
    fs.copyFileSync(file.filepath, savedFilePath);
    
    // Determine Python script parameters based on document type
    let pythonDocType = 'id'; // Default
    
    if (documentType === 'identity' || documentType === 'pan') {
      pythonDocType = 'id';
    } else if (documentType === 'income') {
      pythonDocType = 'income';
    } else if (documentType === 'address') {
      pythonDocType = 'address';
    } else if (documentType === 'bank') {
      pythonDocType = 'bank';
    }
    
    // Path to the Python script
    const scriptPath = path.join(process.cwd(), 'processing', 'ocr_extraction.py');
    
    // Check if the script exists
    if (!fs.existsSync(scriptPath)) {
      console.error(`Python script not found at path: ${scriptPath}`);
      return res.status(500).json({ error: `Python script not found at path: ${scriptPath}` });
    }
    
    // Log the exact command being executed
    const command = `python "${scriptPath}" "${savedFilePath}" "${pythonDocType}"`;
    console.log(`Executing command: ${command}`);
    
    // Execute Python script
    const { stdout, stderr } = await new Promise((resolve, reject) => {
      exec(
        command,
        { maxBuffer: 1024 * 1024 * 10 }, // 10 MB buffer
        (error, stdout, stderr) => {
          if (error) {
            console.error('Python execution error:', error);
            reject(error);
          }
          resolve({ stdout, stderr });
        }
      );
    });

    // Log the raw output
    console.log('Python stdout:', stdout);
    if (stderr) {
      console.error('Python stderr:', stderr);
    }
    
    // Try to parse the JSON output from Python
    let extractedData;
    try {
      extractedData = JSON.parse(stdout);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      console.error('Raw stdout:', stdout);
      return res.status(500).json({ 
        error: 'Error parsing Python script output',
        details: stdout.substring(0, 500) // Include part of the output for debugging
      });
    }
    
    // Return the extracted data
    return res.status(200).json({ success: true, data: extractedData });
    
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  } finally {
    // Clean up the temporary files
    try {
      if (savedFilePath && fs.existsSync(savedFilePath)) {
        fs.unlinkSync(savedFilePath);
      }
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError);
    }
  }
}