import { ChatMessageRoleEnum, MentalProcess, WorkingMemory, createCognitiveStep, indentNicely, useActions, useProcessManager, useSoulMemory } from "@opensouls/engine";
import surrealistDream from "../mentalProcesses/surrealistDream";

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
    const dreamModel = useSoulMemory("dreamModel", "Unknown dream");
    const dreamTime = useSoulMemory("dreamTime", 0);
    const { log } = useActions();

    let step = initialStep;
    let finalStep = initialStep;

    if (dreamTime.current === 1) {

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

    log("No dreams cuz Samantha's still awake!");
    return finalStep;
  }

  export default internalizesTheDream

