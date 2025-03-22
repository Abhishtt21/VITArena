"use client";
import { useState } from 'react';
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";

interface TestCase {
  input: string;
  output: string;
}

interface InputOutputField {
  type: string;
  name: string;
}

const AddProblemForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('EASY');
  const [slug, setSlug] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', output: '' }]);
  const [functionName, setFunctionName] = useState('');
  const [inputFields, setInputFields] = useState<InputOutputField[]>([{ type: '', name: '' }]);
  const [outputFields, setOutputFields] = useState<InputOutputField[]>([{ type: '', name: '' }]);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAddTestCase = () => {
    setTestCases(prev => [...prev, { input: '', output: '' }]);
  };

  const handleTestCaseChange = (index: number, field: keyof TestCase, value: string) => {
    setTestCases(prevTestCases => {
      const newTestCases = [...prevTestCases];
      if (newTestCases[index]) {
        const existingTestCase = newTestCases[index]!;
        const updatedTestCase: TestCase = {
          input: field === 'input' ? value : existingTestCase.input ?? '',
          output: field === 'output' ? value : existingTestCase.output ?? ''
        };
        newTestCases[index] = updatedTestCase;
      }
      return newTestCases;
    });
  };

  const handleAddInputField = () => {
    setInputFields([...inputFields, { type: '', name: '' }]);
  };

  const handleAddOutputField = () => {
    setOutputFields([...outputFields, { type: '', name: '' }]);
  };

  const handleFieldChange = (
    index: number,
    fieldType: 'input' | 'output',
    property: keyof InputOutputField,
    value: string
  ) => {
    const fields = fieldType === 'input' ? inputFields : outputFields;
    const setFields = fieldType === 'input' ? setInputFields : setOutputFields;
    
    const newFields = [...fields];
    if (newFields[index]) {
      newFields[index] = {
        ...newFields[index],
        [property]: value || '',
      } as InputOutputField;
      setFields(newFields);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/problems', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        difficulty,
        slug,
        testCases,
        functionName,
        inputFields,
        outputFields,
      }),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      data = {};
    }

    if (response.ok) {
      setMessage('Problem added successfully!');
      setShowModal(true);
      // Reset form fields
      setTitle('');
      setDescription('');
      setDifficulty('EASY');
      setSlug('');
      setTestCases([{ input: '', output: '' }]);
      setFunctionName('');
      setInputFields([{ type: '', name: '' }]);
      setOutputFields([{ type: '', name: '' }]);
    } else {
      setMessage(`Error: ${data.message || 'Unknown error'}`);
    }
  };

  return (
    <>
      <Card className="p-6 max-w-3xl mx-auto mt-10">
        <form onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-4">Add a New Problem</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter the title"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Description:</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter the description"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="difficulty" className="block text-sm font-medium mb-1">Difficulty:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Slug:</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="Enter the slug"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Function Name:</label>
            <input
              type="text"
              value={functionName}
              onChange={(e) => setFunctionName(e.target.value)}
              required
              placeholder="Enter the function name"
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Test Cases</h2>
            {testCases.map((testCase, index) => (
              <div key={index} className="mb-2">
                <label className="block text-sm font-medium mb-1">Input:</label>
                <textarea
                  value={testCase.input}
                  onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                  required
                  placeholder="Enter test case input"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-1">Output:</label>
                <textarea
                  value={testCase.output}
                  onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                  required
                  placeholder="Enter test case output"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ))}
            <Button type="button" onClick={handleAddTestCase} className="mt-2">
              Add Test Case
            </Button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Input Fields</h2>
            {inputFields.map((field, index) => (
              <div key={index} className="mb-2">
                <label className="block text-sm font-medium mb-1">Type:</label>
                <input
                  type="text"
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, 'input', 'type', e.target.value)}
                  required
                  placeholder="Enter the type"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'input', 'name', e.target.value)}
                  required
                  placeholder="Enter the name"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ))}
            <Button type="button" onClick={handleAddInputField} className="mt-2">
              Add Input Field
            </Button>
          </div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Output Fields</h2>
            {outputFields.map((field, index) => (
              <div key={index} className="mb-2">
                <label className="block text-sm font-medium mb-1">Type:</label>
                <input
                  type="text"
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, 'output', 'type', e.target.value)}
                  required
                  placeholder="Enter the type"
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, 'output', 'name', e.target.value)}
                  required
                  placeholder="Enter the name"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            ))}
            <Button type="button" onClick={handleAddOutputField} className="mt-2">
              Add Output Field
            </Button>
          </div>
          <div className="flex justify-center mt-4">
            <Button type="submit">
              Submit
            </Button>
          </div>
          {message && <p className="mt-4 text-red-500">{message}</p>}
        </form>
      </Card>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Success</h2>
            <p>{message}</p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddProblemForm;
