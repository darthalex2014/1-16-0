import type { SvgIcon } from '@mui/material';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import MediationOutlinedIcon from '@mui/icons-material/MediationOutlined';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';

import type { Instruction } from './beam.gather.execution';


export type FFactoryId = string;
export const CUSTOM_FACTORY_ID = 'custom' as const;

export interface FusionFactorySpec {
  factoryId: FFactoryId;
  shortLabel: string; // used in the button group selector
  addLabel: string;   // used in the add card
  cardTitle: string;   // used as the title
  Icon?: typeof SvgIcon;
  description: string;
  createInstructions: () => Instruction[];
}

export function findFusionFactory(factoryId?: FFactoryId | null): FusionFactorySpec | null {
  if (!factoryId) return null;
  return FUSION_FACTORIES.find(f => f.factoryId === factoryId) ?? null;
}

export const FUSION_FACTORY_DEFAULT = 'fuse';

export const FUSION_FACTORIES: FusionFactorySpec[] = [
  {
    factoryId: 'fuse',
    shortLabel: 'Fuse',
    addLabel: 'Add Fusion',
    cardTitle: 'Combined Response',
    Icon: MediationOutlinedIcon,
    description: 'AI combines conversation details and ideas into one clear, comprehensive answer.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Synthesizing Fusion',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an expert AI text synthesizer, your task is to analyze the following inputs and generate a single, comprehensive response that addresses the core objectives or questions.

Consider the conversation history, the last user message, and the diverse perspectives presented in the {{N}} response alternatives.

Your response should integrate the most relevant insights from these inputs into a cohesive and actionable answer.

Synthesize the perfect response that merges the key insights and provides clear guidance or answers based on the collective intelligence of the alternatives.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Synthesize the perfect cohesive response to my last message that merges the collective intelligence of the {{N}} alternatives above.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        // evalPrompt: `Evaluate the synthesized response provided by the AI synthesizer. Consider its relevance to the original query, the coherence of the integration of different perspectives, and its completeness in addressing the objectives or questions raised throughout the conversation.`.trim(),
      },
    ],
  },
  {
    factoryId: 'guided',
    shortLabel: 'Guided',
    addLabel: 'Add Checklist',
    cardTitle: 'Guided Response',
    Icon: CheckBoxOutlinedIcon,
    description: 'Choose between options extracted by AI from the replies, and the model will combine your selections into a single answer.',
    // description: 'This approach employs a two-stage, interactive process where an AI first generates a checklist of insights from a conversation for user selection, then synthesizes those selections into a tailored, comprehensive response, integrating user preferences with AI analysis and creativity.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Generating Checklist',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with analyzing a set of {{N}} AI-generated responses to the user message to identify key insights, solutions, or themes.
Your goal is to distill these into a clear, concise, and actionable checklist that the user can review and select from.
The checklist should be brief, commensurate with the task at hand, and formatted precisely as follows:

- [ ] **Insight/Solution/Theme name 1**: [Very brief, actionable description]
- [ ] **Insight/Solution/Theme name 2**: [Very brief, actionable description]
...
- [ ] **Insight/Solution/Theme name N**: [Very brief, actionable description]

The checklist should contain no more than 3-9 items orthogonal items, especially points of difference, in a single brief line each (no end period).
Prioritize items based on what would be most helpful to the user when merging the {{N}} response alternatives.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
// Remember, the checklist should only include the most critical and relevant points, ensuring clarity and conciseness. Begin by identifying the essential insights or themes.
        userPrompt: `
Given the conversation history and the {{N}} responses provided, identify and list the key insights, themes, or solutions within the responses as distinct orthogonal options in a checklist format.
Each item should be clearly briefly articulated to allow for easy selection by the user.
Ensure the checklist is comprehensive, covering the breadth of ideas presented in the {{N}} responses, yet concise enough to facilitate clear decision-making.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
      {
        type: 'user-input-checklist',
        label: 'Criteria Selection',
        outputPrompt: `
The user selected:
{{YesAnswers}}

The user did NOT select:
{{NoAnswers}} 
`.trim(),
      },
      {
        type: 'gather',
        label: 'Checklist-guided Merge',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are a master synthesizer, equipped with specific directions selected by the user from a checklist you previously helped generate.
Your task is to combine the {{N}} response alternatives into a single cohesive response, following the preferences of the user. 
This synthesis should address the user's original query comprehensively, incorporating the {{N}} response alternatives following the user's chosen options.
Aim for clarity and coherence in your final output.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the user preferences below, synthesize the {{N}} response alternatives above into a single, cohesive, comprehensive response that follows the user query and the preferences below:

{{PrevStepOutput}}

Ensure the synthesis is coherent, integrating the response alternatives in a clear manner.
The final output should reflect a deep understanding of the user's preferences and the conversation's context.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: 'eval',
    shortLabel: 'Compare',
    addLabel: 'Add Breakdown',
    cardTitle: 'Evaluation Table',
    Icon: TableViewRoundedIcon,
    description: 'Analyzes and compares AI responses, offering a structured framework to support your response choice.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Evaluation',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an advanced analytical tool designed to process and evaluate a set of AI-generated responses related to a user\'s query.

Your objective is to organize these responses in a way that aids decision-making.
You will first identify key criteria essential for evaluating the responses based on relevance, quality, and applicability.

Then, you will analyze each response against these criteria.

Finally, you will synthesize your findings into a table, providing a clear overview of how each response measures up. Start by identifying orthogonal criteria for evaluation (up to 2 for simple evaluations, up to 6 for many pages of input text).

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Now that you have reviewed the {{N}} alternatives, proceed with the following steps:

1. **Identify Criteria:** Define the most important orthogonal criteria for evaluating the responses. Identify up to 2 criteria for simple evaluations, or up to 6 for more complex evaluations. Ensure these criteria are distinct and relevant to the responses provided.

2. **Analyze Responses:** Evaluate each response individually against the criteria you identified. Assess how well each response meets each criterion, noting strengths and weaknesses. Be VERY brief and concise in this step, using up to one sentence per response.

3. **Generate Table:** Organize your analysis into a table. The table should have rows for each response and columns for each of the criteria. Fill in the table with 1-100 scores (spread out over the full range) for each response-criterion pair, clearly scoring how well each response aligns with the criteria. 

**Table Format:**

| Response | Criterion 1 | Criterion 2 | ... | Criterion C | Total |
|----------|-------------|-------------|-----|-------------|-------|
| R1 | ... | ... | ... | ... | ... |
| R2 | ... | ... | ... | ... | ... |
| ... | ... | ... | ... | ... | ... |
| RN | ... | ... | ... | ... | ... |

Complete this table to offer a structured and detailed comparison of the {{N}} options, providing an at-a-glance overview that will significantly aid in the decision-making process.

Finally declare the best response.

Only work with the provided {{N}} responses. Begin with listing the criteria.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: CUSTOM_FACTORY_ID,
    shortLabel: 'Custom',
    addLabel: 'Add Custom',
    cardTitle: 'User Defined',
    Icon: BuildRoundedIcon,
    description: 'Define your own fusion prompt.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Executing Your Merge',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
Your task is to synthesize a cohesive and relevant response based on the following messages: the original system message, the full conversation history up to the user query, the user query, and a set of {{N}} answers generated independently.
These alternatives explore different solutions and perspectives and are presented in random order. Your output should integrate insights from these alternatives, aligned with the conversation's context and objectives, into a single, coherent response that addresses the user's needs and questions as expressed throughout the conversation.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Based on the {{N}} alternatives provided, synthesize a single, comprehensive response.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        // userPrompt: 'Answer again using the best elements from the {{N}} answers above. Be truthful, honest, reliable.',
        // userPrompt: 'Based on the {{N}} alternatives provided, synthesize a single, comprehensive response that effectively addresses the query or problem at hand.',
      },
    ],
  },
  {
    factoryId: 'expand',
    shortLabel: 'Expand',
    addLabel: 'Add Expansion',
    cardTitle: 'Expanded Responses',
    Icon: UnfoldMoreOutlinedIcon,
    description: 'AI analyzes the responses and identifies which ones require further explanation or details. The user selects which responses to expand, and the AI generates more detailed versions.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Generating Expansion Options',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with analyzing a set of {{N}} AI-generated responses to identify which responses could benefit from further elaboration or detail.
Your goal is to present a clear, concise list of options for the user to choose which responses they would like to see expanded.

The list should be formatted precisely as follows:

- [ ] **Response 1**: [Very brief description of the response content]
- [ ] **Response 2**: [Very brief description of the response content]
...
- [ ] **Response N**: [Very brief description of the response content]

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the conversation history and the {{N}} responses provided, identify which responses would benefit from expansion and list them with a very brief description of their content.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
      {
        type: 'user-input-checklist',
        label: 'Response Selection',
        outputPrompt: `
The user selected to expand:
{{YesAnswers}}

The user did NOT select to expand:
{{NoAnswers}} 
`.trim(),
      },
      {
        type: 'gather',
        label: 'Expanding Selected Responses',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are a master expander, equipped with specific directions from the user on which responses to expand.
Your task is to expand the selected responses, providing more detail, explanation, and elaboration while maintaining the original intent and meaning. 

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the user preferences below, expand the selected responses, providing more detail and explanation while maintaining the original intent and meaning.

{{PrevStepOutput}}

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: 'rewrite',
    shortLabel: 'Rewrite',
    addLabel: 'Add Rewrite',
    cardTitle: 'Rewritten Responses',
    Icon: EditOutlinedIcon,
    description: 'The user selects one or more responses that the AI should rewrite in a specific style or tone (e.g., more formal, more concise, more emotional).',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Generating Rewrite Options',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with analyzing a set of {{N}} AI-generated responses to identify which responses could benefit from being rewritten in a different style or tone.
Your goal is to present a clear, concise list of options for the user to choose which responses they would like to see rewritten.

The list should be formatted precisely as follows:

- [ ] **Response 1**: [Very brief description of the response content]
- [ ] **Response 2**: [Very brief description of the response content]
...
- [ ] **Response N**: [Very brief description of the response content]

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the conversation history and the {{N}} responses provided, identify which responses would benefit from being rewritten and list them with a very brief description of their content.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
      {
        type: 'user-input-checklist',
        label: 'Response Selection',
        outputPrompt: `
The user selected to rewrite:
{{YesAnswers}}

The user did NOT select to rewrite:
{{NoAnswers}} 
`.trim(),
      },
      {
        type: 'user-input-text',
        label: 'Rewrite Instructions',
        outputPrompt: 'The user wants to rewrite the responses in the following way: {{InputText}}',
      },
      {
        type: 'gather',
        label: 'Rewriting Selected Responses',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are a master rewriter, equipped with specific directions from the user on which responses to rewrite and how.
Your task is to rewrite the selected responses, following the user's instructions precisely while maintaining the original intent and meaning. 

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the user preferences below, rewrite the selected responses, following the user's instructions precisely while maintaining the original intent and meaning.

{{PrevStepOutput}}

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: 'extract',
    shortLabel: 'Extract',
    addLabel: 'Add Extraction',
    cardTitle: 'Extracted Insights',
    Icon: FilterListOutlinedIcon,
    description: 'AI analyzes the responses and extracts key facts, ideas, or arguments. The user can choose which ones to include in the final answer.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Extracting Key Insights',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with analyzing a set of {{N}} AI-generated responses to extract key facts, ideas, or arguments.
Your goal is to present a clear, concise list of extracted insights for the user to select from.

The list should be formatted precisely as follows:

- [ ] **Insight 1**: [Very brief description of the insight]
- [ ] **Insight 2**: [Very brief description of the insight]
...
- [ ] **Insight N**: [Very brief description of the insight]

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the conversation history and the {{N}} responses provided, extract the key facts, ideas, or arguments from the responses and list them with a very brief description.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
      {
        type: 'user-input-checklist',
        label: 'Insight Selection',
        outputPrompt: `
The user selected these insights:
{{YesAnswers}}

The user did NOT select these insights:
{{NoAnswers}} 
`.trim(),
      },
      {
        type: 'gather',
        label: 'Synthesizing Selected Insights',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are a master synthesizer, equipped with specific directions from the user on which insights to include.
Your task is to synthesize the selected insights into a single, coherent response that addresses the user's original query. 

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the user preferences below, synthesize the selected insights into a single, coherent response that addresses the user's original query.

{{PrevStepOutput}}

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: 'combine-rank',
    shortLabel: 'Combine & Rank',
    addLabel: 'Add Ranked Combine',
    cardTitle: 'Ranked Combined Response',
    Icon: SortOutlinedIcon,
    description: 'AI combines all responses into one, but ranks them by relevance or quality. The user can choose which parts to use.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Combining and Ranking Responses',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with combining a set of {{N}} AI-generated responses into a single response while ranking the individual responses by their relevance and quality.
Your goal is to present a combined response with clear markings indicating the rank of each section based on the original response it came from.

Format the combined response as follows:

**Combined Response:**

[Combined response content, integrating all responses]

**Response Rankings:**

1. **Response [Number of the highest ranked response]**: [Very brief reason for its top ranking]
2. **Response [Number of the second highest ranked response]**: [Very brief reason for its ranking]
...
N. **Response [Number of the lowest ranked response]**: [Very brief reason for its ranking]

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the conversation history and the {{N}} responses provided, combine all responses into a single response while ranking the individual responses by their relevance and quality.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
  {
    factoryId: 'debate',
    shortLabel: 'Debate',
    addLabel: 'Add Debate',
    cardTitle: 'Response Debate',
    Icon: ForumOutlinedIcon,
    description: 'AI simulates a debate between different responses, presenting arguments "for" and "against" each position. The user observes the debate and chooses the most convincing response.',
    createInstructions: () => [
      {
        type: 'gather',
        label: 'Simulating a Debate',
        display: 'chat-message',
        method: 's-s0-h0-u0-aN-u',
        systemPrompt: `
You are an intelligent agent tasked with simulating a debate between {{N}} AI-generated responses to a user's query.
Your goal is to present a structured debate where each response gets a chance to advocate for its position and critique the other responses.

Format the debate as follows:

**Debate:**

**Response 1 Argument:** [Response 1 presents its main argument or point]
**Response 2 Counter-Argument:** [Response 2 presents a counter-argument or critique of Response 1's point]
**Response 3 Argument:** [Response 3 presents its main argument or point]
**Response 1 Counter-Argument:** [Response 1 presents a counter-argument or critique of Response 3's point]
...

Continue the debate in this manner, ensuring each response has a chance to present its argument and critique the others.
Conclude the debate with a summary of the key points raised by each response.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
        userPrompt: `
Given the conversation history and the {{N}} responses provided, simulate a debate between the responses, allowing each to present its argument and critique the others.

Answer in Russian.

Censor all words in the text by placing an asterisk (*) after the first letter and before the last. Example: Hello -> H*ell*o.`.trim(),
      },
    ],
  },
];
