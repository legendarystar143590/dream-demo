import { ChatMessageRoleEnum, MentalProcess, WorkingMemory, createCognitiveStep, indentNicely, useActions, useProcessManager, useSoulMemory } from "@opensouls/engine";
import dreamQuery from "../cognitiveSteps/dreamQuery";
import internalDialog from "../cognitiveSteps/internalDialog";

const dreamGenie = createCognitiveStep(({existingDream}: { existingDream?: string }) => {
  const userName = useSoulMemory("userName")
      return {
      command: ({ soulName: name }: WorkingMemory) => {
        return {
          role: ChatMessageRoleEnum.System,
          model: "exp/nous-hermes-2-mixtral-fp8",
          content: indentNicely`
            You are the daimon who orchestrates the dreams of ${name}.

            ## Existing Dream
            ${existingDream || "No dream yet manifested"}
  
            ## Description
            Sketch the plot of the surrealist dream that ${name} is having, inspired by the provided chat history. 
            ${name} should encounter ${userName.current} in the dream in different locales, with scenes bleeding into each other.

            ### Structure
            Break the dream up into 3-4 scenes. 

            ### Style
            Use surrealist techniques to create a dream that is both visually and narratively compelling.
          
            ## Rules
            * Don't self-censor yourself.
            * Use Markdown to format your response.
          `
        }
      },
      postProcess: async (_mem: WorkingMemory, response: string) => {
        return [
          {
            role: ChatMessageRoleEnum.Assistant,
            content: response
          },
          response
        ]
      }
    }
  })

  const internalizesTheDream: MentalProcess = async ({ workingMemory: initialStep }) => {
    const dreamModel = useSoulMemory("dreamModel", "");
    const dreamTime = useSoulMemory("dreamTime", 0);
    const { log } = useActions();

    let step = initialStep;
    let finalStep = initialStep;
    
    if (dreamTime.current === 1)  {

      const [, alchemy] = await dreamGenie(
        step, 
        {
          existingDream: dreamModel.current
        }, 
        { model: "exp/nous-hermes-2-mixtral-fp8" }
      );
      dreamModel.current = alchemy;
      log("Dream model:", dreamModel.current);

      return finalStep;
    }

  //   if (dreamTime.current === 1 && dreamModel.current)  {

  //   const [, learnedSomethingNew] = await dreamQuery(
  //     step,
  //     `The user's messages have influenced ${step.soulName}'s dream in some way.`,
  //     { model: "quality" }
  //   )
  //   log("Update dream?", learnedSomethingNew)
  //   if (learnedSomethingNew) {
  //     let dreamUpdate
  //     [step, dreamUpdate] = await internalDialog(step,
  //       {
  //         instructions: `How has the plot of the dream been altered by the user's messages?`,
  //         verb: "mused",
  //         persona: "Daimon"
  //       },
  //       { model: "exp/nous-hermes-2-mixtral-fp8" }
  //     )
  //     log("Dream updates:", dreamUpdate)

  //     const [, alchemy] = await dreamGenie(
  //       step, 
  //       {
  //         existingDream: dreamModel.current
  //       }, 
  //       { model: "exp/nous-hermes-2-mixtral-fp8" }
  //     );
  //     dreamModel.current = alchemy;
  //     log("Dream model:", dreamModel.current);

  //     return finalStep;
  //   }
  // }

  if (dreamTime.current === 0) {
    log("No dreams cuz Samantha's still awake!");
  }
    return finalStep;
  }

  export default internalizesTheDream