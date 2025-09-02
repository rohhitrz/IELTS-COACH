import {
  ListeningContent,
  ReadingContent,
  SpeakingContent,
  WritingContent,
  WritingEvaluation,
  GeneralEvaluation,
} from "../types";

// Mock data for local development
export async function generateListeningTest(): Promise<ListeningContent> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return {
    scenario: "Mock listening scenario about university life",
    transcript: "This is a mock transcript for testing purposes...",
    questions: [
      {
        id: "1",
        question: "What is the main topic?",
        type: "multiple_choice",
        options: ["A) University", "B) Work", "C) Travel"],
        answer: "A) University"
      }
    ]
  };
}

export async function generateReadingTest(): Promise<ReadingContent> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    passages: [
      {
        title: "Mock Reading Passage",
        passage: "This is a mock reading passage for testing the UI...",
        questions: [
          {
            id: "1",
            question: "What is this passage about?",
            type: "multiple_choice",
            options: ["A) Testing", "B) Reading", "C) Mock data"],
            answer: "A) Testing"
          }
        ]
      }
    ]
  };
}

export async function generateWritingTest(): Promise<WritingContent> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Array of realistic IELTS Task 1 scenarios
  const task1Options = [
    {
      prompt: "The chart below shows the percentage of households in owned and rented accommodation in England and Wales between 1918 and 2011. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      chartData: {
        type: "line" as const,
        title: "Percentage of households in owned and rented accommodation in England and Wales (1918-2011)",
        labels: ["1918", "1939", "1953", "1961", "1971", "1981", "1991", "2001", "2011"],
        datasets: [
          {
            label: "Households in owned accommodation",
            data: [23, 32, 42, 50, 58, 60, 67, 69, 65]
          },
          {
            label: "Households in rented accommodation", 
            data: [77, 68, 58, 50, 42, 40, 33, 31, 35]
          }
        ]
      }
    },
    {
      prompt: "The bar chart below shows the top ten countries for the production and consumption of electricity in 2014. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      chartData: {
        type: "bar" as const,
        title: "Top 10 countries for electricity production and consumption in 2014 (billion kWh)",
        labels: ["China", "USA", "Russia", "Japan", "India", "Canada", "France", "Brazil", "Germany", "Korea"],
        datasets: [
          {
            label: "Production",
            data: [5398, 4099, 1057, 936.2, 871, 618.9, 561.2, 530.7, 526.6, 485.1]
          },
          {
            label: "Consumption",
            data: [5322, 3866, 1038, 856.7, 698.8, 499.9, 462.9, 455.8, 582.5, 449.5]
          }
        ]
      }
    },
    {
      prompt: "The pie chart below shows the main reasons why agricultural land becomes less productive. The table shows how these causes affected three regions of the world during the 1990s. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.",
      chartData: {
        type: "pie" as const,
        title: "Worldwide land degradation by cause",
        labels: ["Over-grazing", "Deforestation", "Over-cultivation", "Other"],
        datasets: [
          {
            label: "Percentage",
            data: [35, 30, 28, 7]
          }
        ]
      }
    }
  ];

  // Array of realistic IELTS Task 2 prompts
  const task2Options = [
    "Some people think that all university students should study whatever they like. Others believe that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
    
    "In some countries, many more people are choosing to live alone nowadays than in the past. Do you think this is a positive or negative development? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
    
    "Some people say that the main environmental problem of our time is the loss of particular species of plants and animals. Others say that there are more important environmental problems. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
    
    "In many countries, paying for things using mobile phone apps is becoming increasingly common. Does this development have more advantages or disadvantages? Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.",
    
    "Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations. Discuss both these views and give your own opinion. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words."
  ];

  // Randomly select one option from each array
  const selectedTask1 = task1Options[Math.floor(Math.random() * task1Options.length)];
  const selectedTask2 = task2Options[Math.floor(Math.random() * task2Options.length)];

  // Generate chart URL using QuickChart
  const chartJsConfig = {
    type: selectedTask1.chartData.type,
    data: {
      labels: selectedTask1.chartData.labels,
      datasets: selectedTask1.chartData.datasets.map(dataset => ({
        ...dataset,
        backgroundColor: selectedTask1.chartData.type === 'pie' 
          ? ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
          : dataset.label.includes('Production') || dataset.label.includes('owned') 
            ? '#36A2EB' 
            : '#FF6384',
        borderColor: selectedTask1.chartData.type === 'line' 
          ? (dataset.label.includes('owned') ? '#36A2EB' : '#FF6384')
          : undefined,
        fill: selectedTask1.chartData.type === 'line' ? false : undefined
      }))
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: selectedTask1.chartData.title,
          font: { size: 14 }
        },
        legend: {
          display: selectedTask1.chartData.datasets.length > 1,
          position: 'bottom'
        }
      },
      scales: selectedTask1.chartData.type !== 'pie' ? {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: selectedTask1.chartData.type === 'bar' ? 'Billion kWh' : 'Percentage (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: selectedTask1.chartData.type === 'bar' ? 'Countries' : 'Year'
          }
        }
      } : undefined
    }
  };

  const stringifiedConfig = JSON.stringify(chartJsConfig);
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(stringifiedConfig)}&width=700&height=450&backgroundColor=white`;

  return {
    task1: {
      prompt: selectedTask1.prompt,
      imageUrl: chartUrl,
      chartData: selectedTask1.chartData
    },
    task2: {
      prompt: selectedTask2
    }
  };
}

export async function generateSpeakingTest(): Promise<SpeakingContent> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    part1: {
      topic: "Mock Topic",
      questions: ["Tell me about yourself", "What do you do?"]
    },
    part2: {
      cueCard: "Mock cue card topic",
      points: ["Point 1", "Point 2", "Point 3"]
    },
    part3: {
      topic: "Mock Discussion",
      questions: ["What do you think about...?", "How has this changed?"]
    }
  };
}

export async function evaluateWriting(): Promise<WritingEvaluation> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Simulate realistic IELTS evaluation - most candidates get 5.5-6.5
  const evaluations = [
    {
      taskResponse: { 
        band: 5, 
        feedback: "Task 1: The response attempts to describe the chart but lacks a clear overview and contains inaccuracies in data interpretation. Task 2: The essay addresses the topic but the position is unclear and ideas are underdeveloped with limited examples." 
      },
      coherenceAndCohesion: { 
        band: 5, 
        feedback: "Basic organization is present but paragraphing is inconsistent. Limited range of cohesive devices with some mechanical overuse of linking words. The progression of ideas is not always clear." 
      },
      lexicalResource: { 
        band: 5, 
        feedback: "Limited range of vocabulary with noticeable repetition. Some attempts at less common vocabulary but with errors in word choice and collocation. Several spelling errors present that may cause strain for the reader." 
      },
      grammaticalRangeAndAccuracy: { 
        band: 5, 
        feedback: "Mix of simple and complex sentences but with limited flexibility. Frequent grammatical errors including tense inconsistency, subject-verb disagreement, and article errors. Punctuation is often faulty." 
      },
      overallBandScore: 5.0,
      strengths: "Shows basic understanding of task requirements and attempts to organize ideas into paragraphs. Some effort to use varied vocabulary.",
      areasForImprovement: "Focus on accuracy - reduce grammatical and spelling errors. Develop ideas more fully with specific examples. Improve data interpretation skills for Task 1. Work on paragraph structure and coherent progression of ideas.",
      wordCountAnalysis: "Task 1: Approximately 140 words (below 150 minimum - penalty applied). Task 2: Approximately 230 words (below 250 minimum - penalty applied). Both tasks need to meet word count requirements.",
      errorAnalysis: "Grammar errors: 12+ including tense inconsistency, article errors, subject-verb disagreement. Spelling errors: 8 including 'recieve', 'seperate', 'occured'. Vocabulary errors: 5 including inappropriate word choices and collocations."
    },
    {
      taskResponse: { 
        band: 6, 
        feedback: "Task 1: Adequately covers the requirements with a basic overview, though some details may be inaccurate or irrelevant. Task 2: Addresses all parts of the task with a relevant position, but conclusions may be unclear or repetitive." 
      },
      coherenceAndCohesion: { 
        band: 6, 
        feedback: "Information is arranged coherently with clear overall progression. Uses cohesive devices effectively but may be mechanical. Paragraphing is generally appropriate but not always logical." 
      },
      lexicalResource: { 
        band: 6, 
        feedback: "Adequate range of vocabulary for the task with some evidence of style and flexibility. Some less common vocabulary used but with occasional inaccuracies. Minor spelling errors that do not impede communication." 
      },
      grammaticalRangeAndAccuracy: { 
        band: 6, 
        feedback: "Mix of simple and complex sentence forms with good control of grammar and punctuation, though some errors occur. Errors rarely reduce communication effectiveness." 
      },
      overallBandScore: 6.0,
      strengths: "Clear task understanding with adequate development of ideas. Generally accurate grammar with good sentence variety. Appropriate use of formal register.",
      areasForImprovement: "Enhance vocabulary precision and reduce repetition. Improve accuracy in complex structures. Strengthen conclusion and ensure all ideas are fully developed with stronger examples.",
      wordCountAnalysis: "Task 1: Approximately 165 words (meets minimum requirement). Task 2: Approximately 275 words (meets minimum requirement). Good adherence to word count guidelines.",
      errorAnalysis: "Grammar errors: 6-8 minor errors including occasional tense slips and preposition mistakes. Spelling errors: 2-3 minor errors. Vocabulary: Generally appropriate with some imprecise word choices but meaning is clear."
    }
  ];
  
  // Randomly select one of the realistic evaluations
  return evaluations[Math.floor(Math.random() * evaluations.length)];
}

export async function evaluateGeneral(): Promise<GeneralEvaluation> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    estimatedBand: 7,
    feedback: "Mock general evaluation feedback",
    strengths: "Mock strengths",
    areasForImprovement: "Mock areas for improvement"
  };
}