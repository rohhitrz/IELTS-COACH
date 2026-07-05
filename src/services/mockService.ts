import {
  ListeningContent,
  ReadingContent,
  SpeakingContent,
  WritingContent,
  WritingEvaluation,
  SpeakingEvaluation,
  PronunciationFeedback,
} from "../types";

// Mock data for local development
export async function generateListeningTest(): Promise<ListeningContent> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  return {
    scenario: "A student phones the Riverside Sports Centre to ask about membership options and opening hours.",
    transcript: `Receptionist: Good morning, Riverside Sports Centre, Karen speaking. How can I help you?
Student: Oh hello. I've just moved to the area and I'd like some information about joining the centre.
Receptionist: Of course. Well, we have three types of membership. The full membership is forty-five pounds a month, and that gives you access to the pool, the gym, and all the fitness classes.
Student: Forty-five pounds... right. And the others?
Receptionist: The off-peak membership is thirty pounds a month, but you can only use the facilities before four p.m. on weekdays. And then there's a student membership at twenty-two pounds fifty, though you'll need to show a valid student card.
Student: That's the one for me. Could you tell me the opening hours?
Receptionist: We open at six thirty in the morning, Monday to Friday, and close at ten at night. On weekends we open from eight until six.
Student: Great. And how do I get to you? I live near the railway station.
Receptionist: From the station, turn left onto Bridge Road, walk past the library, and take the second right into Mill Lane. We're directly opposite the park entrance.
Student: Second right into Mill Lane, opposite the park. Perfect. And who should I ask for when I come in?
Receptionist: Ask for the membership coordinator, Mr. Okafor. That's O-K-A-F-O-R.
Student: O-K-A-F-O-R. Got it. One last thing — is there a joining fee?
Receptionist: There normally is, but we're running a promotion until the thirty-first of October, so if you join before then, the fee is waived.
Student: Brilliant. I'll come in on Thursday. Thanks so much for your help.`,
    questions: [
      { id: "1", question: "How much does the full membership cost per month?", type: "short_answer", answer: "45 pounds", explanation: "The receptionist says 'the full membership is forty-five pounds a month'.", category: "number" },
      { id: "2", question: "What is the monthly price of the student membership?", type: "short_answer", answer: "22.50", explanation: "She quotes 'a student membership at twenty-two pounds fifty'.", category: "number" },
      { id: "3", question: "Until what time can off-peak members use the facilities on weekdays?", type: "short_answer", answer: "4 pm", explanation: "'you can only use the facilities before four p.m. on weekdays'.", category: "date_time" },
      { id: "4", question: "What time does the centre open on weekdays?", type: "multiple_choice", options: ["6:00 am", "6:30 am", "8:00 am"], answer: "6:30 am", explanation: "'We open at six thirty in the morning, Monday to Friday'.", category: "date_time" },
      { id: "5", question: "On weekends the centre closes at ______.", type: "sentence_completion", answer: "6", explanation: "'On weekends we open from eight until six'.", category: "date_time" },
      { id: "6", question: "Which street should the student turn into after passing the library?", type: "multiple_choice", options: ["Bridge Road", "Mill Lane", "Park Street"], answer: "Mill Lane", explanation: "'walk past the library, and take the second right into Mill Lane'.", category: "place_direction" },
      { id: "7", question: "The sports centre is directly opposite the ______ entrance.", type: "sentence_completion", answer: "park", explanation: "'We're directly opposite the park entrance'.", category: "place_direction" },
      { id: "8", question: "How is the membership coordinator's surname spelled?", type: "short_answer", answer: "Okafor", explanation: "The name is spelled out: 'O-K-A-F-O-R'.", category: "name_spelling" },
      { id: "9", question: "Until what date is the joining fee waived?", type: "short_answer", answer: "31 October", explanation: "'we're running a promotion until the thirty-first of October'.", category: "date_time" },
      { id: "10", question: "What is the main purpose of the student's call?", type: "multiple_choice", options: ["To book a fitness class", "To ask about joining the centre", "To complain about opening hours"], answer: "To ask about joining the centre", explanation: "The student opens with 'I'd like some information about joining the centre'.", category: "main_idea" },
    ]
  };
}

export async function generateReadingTest(): Promise<ReadingContent> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return {
    passages: [
      {
        title: "The Secret Life of Urban Foxes",
        passage: `Urban foxes have become a familiar sight in many British cities over the past fifty years. Their move into towns began in the 1930s, when low-density suburban housing spread rapidly across southern England, creating an ideal mosaic of gardens, railway embankments and quiet corners. Contrary to popular belief, foxes were not driven into cities by countryside food shortages; rather, they simply colonised a new and rewarding habitat.\n\nA typical urban fox family occupies a territory of around forty hectares, considerably smaller than rural territories, which may exceed several hundred. The abundance of food explains the difference. Studies in Bristol, the most intensively researched fox population in the world, found that household food waste and deliberate feeding by residents accounted for over half of the urban fox diet, supplemented by earthworms, insects, and wild fruit.\n\nPublic attitudes to urban foxes are strikingly polarised. Surveys suggest that roughly two-thirds of urban residents enjoy seeing foxes, while a vocal minority regards them as vermin. Researchers note, however, that documented cases of foxes attacking humans are vanishingly rare, and that the animals' reputation for raiding bins is largely exaggerated: foxes scavenge opportunistically but obtain most food from lawns and flowerbeds in the form of invertebrates.`,
        questions: [
          { id: "r1", question: "Foxes first moved into British cities because rural food supplies collapsed.", type: "true_false_not_given", answer: "False", explanation: "The passage states foxes 'were not driven into cities by countryside food shortages; rather, they simply colonised a new and rewarding habitat'." },
          { id: "r2", question: "What decade did foxes begin moving into British towns?", type: "short_answer", answer: "1930s", explanation: "'Their move into towns began in the 1930s'." },
          { id: "r3", question: "How large is a typical urban fox territory?", type: "multiple_choice", options: ["Around 40 hectares", "Several hundred hectares", "Under 10 hectares"], answer: "Around 40 hectares", explanation: "'A typical urban fox family occupies a territory of around forty hectares'." },
          { id: "r4", question: "Bristol's fox population is the most studied in the world.", type: "true_false_not_given", answer: "True", explanation: "The passage calls Bristol 'the most intensively researched fox population in the world'." },
          { id: "r5", question: "Most urban residents want foxes removed from cities.", type: "true_false_not_given", answer: "False", explanation: "'roughly two-thirds of urban residents enjoy seeing foxes' — only a minority regards them as vermin." },
          { id: "r6", question: "Foxes obtain most of their food by raiding household bins.", type: "true_false_not_given", answer: "False", explanation: "The passage says the bin-raiding reputation 'is largely exaggerated' and most food comes from invertebrates in lawns and flowerbeds." },
        ]
      },
      {
        title: "The Rise of Vertical Farming",
        passage: `Vertical farming — the practice of growing crops in stacked layers inside controlled environments — has attracted billions in investment over the last decade. Proponents argue that it uses up to 95 per cent less water than field agriculture, eliminates pesticide use, and shortens supply chains by locating production inside cities.\n\nYet the industry faces a stubborn obstacle: energy. Replacing sunlight with LED lighting is extraordinarily power-hungry, and several high-profile vertical farming companies collapsed in the early 2020s when electricity prices rose. Critics also point out that the technique suits only a narrow range of high-value crops, chiefly leafy greens and herbs, which contribute little to global calorie supply.\n\nThe most promising future for the sector may therefore be hybrid: greenhouses that combine natural light with supplemental LEDs, and vertical farms attached to sources of waste heat and renewable power. In such configurations, the arithmetic of energy begins to favour the farmers rather than the utility companies.`,
        questions: [
          { id: "r7", question: "Which heading best summarises the second paragraph?", type: "matching_headings", options: ["A promising investment climate", "The energy problem", "Consumer resistance to new foods"], answer: "The energy problem", explanation: "The second paragraph is devoted to the industry's 'stubborn obstacle: energy'." },
          { id: "r8", question: "Vertical farming can reduce water use by up to what percentage?", type: "short_answer", answer: "95", explanation: "'it uses up to 95 per cent less water than field agriculture'." },
          { id: "r9", question: "Several vertical farming companies failed because of rising electricity prices.", type: "true_false_not_given", answer: "True", explanation: "'several high-profile vertical farming companies collapsed in the early 2020s when electricity prices rose'." },
          { id: "r10", question: "Vertical farms currently grow a wide variety of staple crops.", type: "true_false_not_given", answer: "False", explanation: "Critics say the technique 'suits only a narrow range of high-value crops, chiefly leafy greens and herbs'." },
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
  const selected = evaluations[Math.floor(Math.random() * evaluations.length)];
  return {
    ...selected,
    sentenceSuggestions: [
      {
        original: "The graph show that the number of peoples increased.",
        improved: "The graph shows that the number of people increased steadily.",
        explanation: "Third-person singular subject 'the graph' needs 'shows'; 'people' is already plural; adding an adverb like 'steadily' describes the trend precisely.",
        category: "grammar" as const,
      },
      {
        original: "In nowadays society, technology is very important thing.",
        improved: "In today's society, technology plays a vital role.",
        explanation: "'In nowadays' is not a valid collocation — use 'today's society' or simply 'nowadays'. 'Plays a vital role' is a natural high-band collocation replacing the vague 'very important thing'.",
        category: "vocabulary" as const,
      },
      {
        original: "Secondly, there are many advantages. For example education.",
        improved: "A further advantage lies in education: online platforms give students in remote areas access to world-class teaching.",
        explanation: "The original fragment ('For example education.') is not a complete sentence, and the idea is left undeveloped. High-band writing extends each example with a specific supporting detail.",
        category: "coherence" as const,
      },
    ],
    modelAnswers: {
      task1:
        "The chart illustrates changes in the proportion of households owning and renting accommodation in England and Wales between 1918 and 2011.\n\nOverall, home ownership rose substantially over the period while renting declined, with the two categories reversing their positions around 1971. In 1918, only 23% of households owned their homes, whereas 77% rented. Ownership climbed steadily to 50% by 1961, and continued rising to a peak of 69% in 2001, before dipping slightly to 65% in 2011. Renting mirrored this trajectory in reverse, falling from its 1918 high to a low of 31% in 2001, then recovering modestly to 35% by the end of the period.\n\nThe most striking feature is the crossover in 1971, when both categories stood at exactly 50%, marking the point at which owning became the dominant form of tenure — a position it retained for the remainder of the period despite the slight reversal after 2001.",
      task2:
        "It is sometimes argued that university students should be free to study any subject they wish, while others contend that places should be restricted to disciplines with clear practical value, such as science and technology. This essay considers both positions before concluding that freedom of choice serves society better.\n\nAdvocates of restriction point to labour-market needs: economies facing shortages of engineers and programmers arguably cannot afford to subsidise degrees with limited vocational application. Public money, they claim, should generate measurable returns in productivity and innovation.\n\nHowever, this view rests on the flawed assumption that the value of education can be predicted in advance. Many of the skills employers prize most — critical thinking, communication, cultural literacy — are cultivated precisely by the humanities and arts. Furthermore, students compelled to study subjects they find uninspiring tend to underperform and abandon their courses, wasting the very resources the policy aims to protect. History also shows that fields dismissed as impractical, from pure mathematics to linguistics, have repeatedly produced transformative applications decades later.\n\nIn conclusion, while the concern for economic relevance is understandable, restricting study to ostensibly useful subjects is short-sighted. Universities best serve society when students pursue disciplines that genuinely engage them, since motivation, not ministerial prediction, is the real engine of achievement.",
    },
  };
}

export async function evaluateSpeaking(): Promise<SpeakingEvaluation> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    fluencyAndCoherence: {
      band: 6,
      feedback: "You maintained a reasonable flow in Parts 1 and 3, but the Part 2 long turn was under a minute, which limits your fluency score. Ideas were connected with basic markers ('and', 'so', 'because') — try a wider range such as 'what's more', 'having said that', 'the thing is'."
    },
    lexicalResource: {
      band: 6,
      feedback: "Vocabulary was adequate but safe. You repeated 'very good' and 'nice' several times where stronger choices ('memorable', 'rewarding', 'picturesque') were available. Some good collocations ('spend quality time')."
    },
    grammaticalRangeAndAccuracy: {
      band: 5.5,
      feedback: "Mostly simple sentence structures with several tense slips ('I go there last year'). Complex sentences were attempted but often broke down. Focus on past narrative tenses and conditionals."
    },
    pronunciation: {
      band: 6,
      feedback: "Estimate only — this criterion was assessed from the transcript, not audio. Based on word-level evidence there were no signs of communication breakdown. Record and replay your answers to self-check word stress and intonation."
    },
    overallBandScore: 6.0,
    strengths: "You addressed every question directly, developed answers beyond single sentences, and used some natural conversational phrases.",
    areasForImprovement: "Extend your Part 2 answer to the full two minutes using the cue card points as a structure. Reduce fillers by pausing silently instead of saying 'like' or 'you know'. Practise past tense narration aloud.",
    corrections: [
      { original: "I go there last year with my family", improved: "I went there last year with my family", explanation: "Past time marker 'last year' requires past simple 'went'.", category: "grammar" },
      { original: "it was very good experience", improved: "it was a really memorable experience", explanation: "Countable noun needs an article, and 'memorable' is a higher-band choice than 'very good'.", category: "vocabulary" },
      { original: "peoples in my country is friendly", improved: "people in my country are friendly", explanation: "'People' is already plural — no '-s', and it takes a plural verb.", category: "grammar" }
    ],
    paceAnalysis: "Your average pace was about 110 words per minute, a little below the natural conversational range of 130-170 wpm, suggesting hesitation. Around 6 filler words per minute were detected (the true figure may be higher, as speech recognition filters some out)."
  };
}

export async function evaluatePronunciation(): Promise<PronunciationFeedback> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    band: 6,
    feedback: "Generally intelligible throughout with occasional lapses in word stress on multi-syllable words. Sentence-level intonation was somewhat flat, which makes longer turns harder to follow. Chunking was good — you paused at natural clause boundaries.",
    examples: [
      "'photography' was stressed on the first syllable — it should be pho-TOG-ra-phy",
      "'comfortable' was pronounced with four full syllables — natural speech reduces it to COMF-t?-bl",
      "Good clear delivery of 'environment' and 'definitely'"
    ]
  };
}