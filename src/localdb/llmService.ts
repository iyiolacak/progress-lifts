import { RxDocument } from "rxdb";
import { JobDocType } from "./schema/jobs";

const llmDocSchema = {
  title: "an LLM Doc",
  version: 0,

  primaryKey: "id",
  type: "object",

  properties: {
    type: "string", //  autofill | phaseB | clarification question | ...
    content: {
      type: "object",

    }
  }
}

const LLMstatics = () => {return (

            const sendToLLM = async function (
              this: RxDocument<JobDocType>,
              prompt: string,
              apiKey: string,
              model: string
            ): Promise<string> {
              // Send the given prompt to the LLM specified in this job's entry
              // Returns the LLM response text
              // Throws on error
              const entryId = this.get("entryId");
              const entry = await db.collections.entries
                .findOne(entryId)
                .exec();
              if (!entry) throw new Error("Entry not found");

              // Call the API
              const response = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                  },
                  body: JSON.stringify({
                    model,
                    messages: [{ role: "user", content: prompt }],
                  }),
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                  `LLM API error: ${response.status} ${response.statusText} - ${errorText}`
                );
              }

              const data = await response.json();
              const text = data.choices?.[0]?.message?.content;
              if (!text) throw new Error("No response from LLM");

              return text;
            }

)}