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
  
  const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  return {
    txHash: mockTxHash,
    verified: true,
  };
};

// Generate blockchain verification link
export const getBlockchainVerificationLink = (txHash: string): string => {
  // Return a link to view the transaction on a blockchain explorer
  // This would be a real blockchain explorer in production
  return `https://polygonscan.com/tx/${txHash}`;
};