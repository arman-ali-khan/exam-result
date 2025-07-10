'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';

export function ExcelUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('Parsed Excel data:', jsonData);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // TODO: Process the Excel data and insert into database
      // This is a placeholder - you would implement the actual data processing logic here
      setUploadResult({
        success: jsonData.length,
        failed: 0,
        errors: [],
      });

    } catch (error) {
      console.error('Error processing Excel file:', error);
      setUploadResult({
        success: 0,
        failed: 1,
        errors: ['Error processing Excel file. Please check the format and try again.'],
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Student Name': 'John Doe',
        'Roll Number': '123456',
        'Registration Number': '2023123456',
        'Father Name': 'John Smith',
        'Mother Name': 'Jane Smith',
        'Date of Birth': '2005-01-15',
        'Institute Name': 'Example High School',
        'Board Code': 'DEB',
        'Session': 'SSC 2025',
        'Exam Type': 'Regular',
        'Subject Code 1': '101',
        'Subject Grade 1': 'A+',
        'Subject Marks 1': '85',
        'Subject Code 2': '107',
        'Subject Grade 2': 'A',
        'Subject Marks 2': '80',
        // Add more subject columns as needed
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Results Template');
    XLSX.writeFile(wb, 'student-results-template.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Excel Upload</h1>
        <Button onClick={downloadTemplate} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Student Results</CardTitle>
          <CardDescription>
            Upload student results from Excel file. Download the template first to see the required format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload Excel File</h3>
                <p className="text-gray-500">
                  Select an Excel file (.xlsx) containing student results
                </p>
                <div className="flex justify-center">
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <Button disabled={isUploading} className="gap-2" asChild>
                      <span>
                        <Upload className="h-4 w-4" />
                        Choose File
                      </span>
                    </Button>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Upload Result */}
            {uploadResult && (
              <Alert className={uploadResult.errors.length > 0 ? 'border-red-200' : 'border-green-200'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="flex gap-4">
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Success: {uploadResult.success}
                      </Badge>
                      {uploadResult.failed > 0 && (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          Failed: {uploadResult.failed}
                        </Badge>
                      )}
                    </div>
                    {uploadResult.errors.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {uploadResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Excel Format Requirements</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Download the template to see the required column structure</li>
                <li>• Each row should contain one student's complete information</li>
                <li>• Subject columns should follow the pattern: Subject Code 1, Subject Grade 1, Subject Marks 1</li>
                <li>• Grades should be one of: A+, A, A-, B, C, D, F</li>
                <li>• All required fields must be filled</li>
                <li>• Board codes should match existing education boards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}