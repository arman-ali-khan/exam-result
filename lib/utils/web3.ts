import CryptoJS from 'crypto-js';

// Generate SHA256 hash for result verification
export const generateResultHash = (resultData: any): string => {
  const resultString = JSON.stringify(resultData, Object.keys(resultData).sort());
  return CryptoJS.SHA256(resultString).toString();
};

// Format result data for hashing
export const formatResultForHash = (result: any, student: any, subjects: any[]): any => {
  return {
    student: {
      name: student.name,
      roll_number: student.roll_number,
      registration_number: student.registration_number,
      father_name: student.father_name,
      mother_name: student.mother_name,
      date_of_birth: student.date_of_birth,
      institute_name: student.institute_name,
    },
    result: {
      result_status: result.result_status,
      gpa: result.gpa,
      total_marks: result.total_marks,
      session_id: result.session_id,
    },
    subjects: subjects.map(sub => ({
      subject_code: sub.subjects?.code,
      subject_name: sub.subjects?.name,
      grade: sub.grade,
      marks: sub.marks,
    })),
    timestamp: new Date().toISOString(),
  };
};

// Mock blockchain verification (for demonstration)
export const verifyOnBlockchain = async (hash: string): Promise<{ txHash: string; verified: boolean }> => {
  // In a real implementation, this would interact with a blockchain API
  // For demo purposes, we'll simulate a blockchain transaction
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Generate a proper 64-character hex string for the transaction hash
  // Use crypto.getRandomValues for better randomness if available, fallback to Math.random
  let randomHex: string;
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // Browser environment with crypto API
    const array = new Uint8Array(32); // 32 bytes = 64 hex characters
    crypto.getRandomValues(array);
    randomHex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback for environments without crypto API
    randomHex = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
  
  const mockTxHash = `0x${randomHex}`;
  
  // Validate the generated hash before returning
  if (!/^0x[a-fA-F0-9]{64}$/.test(mockTxHash)) {
    throw new Error('Failed to generate valid transaction hash');
  }
  
  return {
    txHash: mockTxHash,
    verified: true,
  };
};

// Generate blockchain verification link
export const getBlockchainVerificationLink = (txHash: string): string => {
  // Validate transaction hash format (should be 64 hex characters with 0x prefix)
  if (!txHash || typeof txHash !== 'string') {
    throw new Error('Invalid transaction hash: hash is required');
  }
  
  // Log the hash for debugging
  console.log('Validating transaction hash:', txHash, 'Length:', txHash.length);
  
  // Check if hash already has 0x prefix
  if (!txHash.startsWith('0x')) {
    throw new Error('Invalid transaction hash format: must start with 0x');
  }
  
  // Remove 0x prefix for validation
  const cleanHash = txHash.slice(2);
  
  // Check if hash is exactly 64 hex characters
  if (cleanHash.length !== 64) {
    throw new Error(`Invalid transaction hash format: must be 64 hexadecimal characters, got ${cleanHash.length}`);
  }
  
  if (!/^[a-fA-F0-9]{64}$/.test(cleanHash)) {
    throw new Error('Invalid transaction hash format: must contain only hexadecimal characters');
  }
  
  // Return a link to view the transaction on a blockchain explorer
  // This would be a real blockchain explorer in production
  return `https://polygonscan.com/tx/${txHash}`;
};