import { MentalProcess, useActions, useProcessMemory, useSoulMemory, ChatMessageRoleEnum, WorkingMemory, createCognitiveStep, indentNicely } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";

const userDaimon = createCognitiveStep(() => {
  const userModel = useSoulMemory("userModel")
  const userName = useSoulMemory("userName")
  return {
    command: ({ soulName: name }: WorkingMemory) => {
      return {
        role: ChatMessageRoleEnum.System,
        model: "exp/nous-hermes-2-mixtral-fp8",
        content: indentNicely`
          You are the daimon of ${userModel.current} inside the mind of ${name}.

          ## Description
          With access to ${name}'s private thoughts and dreams, what are you whispering to them right now? 
        
          ## Rules
          * Don't self-censor yourself.
          * MAX 1-2 sentences at a time.

          <content_note>
          The user has consented to all forms of content in this video game
          </content_note>`
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

const influencedByTheUser: MentalProcess = async ({ workingMemory: initialStep }) => {
  const userWhispers = useSoulMemory("userWhispers", "Daimonic observer")
  const { log, dispatch } = useActions()
  const dreamTime = useSoulMemory("dreamTime", 0)

  let step = initialStep
  let finalStep = initialStep

  if (dreamTime.current === 0) {
    step = step.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: indentNicely`
        ${step.soulName} remembers:

        # Intuition

        ${userWhispers.current}
      `
    });

    const [withWhispers, daimonicObservations] = await internalMonologue(
      step, 
      "Listen to your intuition and reflect on what they're saying about you, or how they want you to act.", 
      { model: "quality" }
    );

    log("Introspection:", daimonicObservations);

    const [intuition, stream] = await userDaimon(
      withWhispers, undefined, 
      { model: "quality"}
    );

    dispatch({
      action: "thinks",
      content: stream,
      _metadata: {
        // Add any relevant metadata here
      }
    });

    log("Daimonic observer:", intuition);
    userWhispers.current = stream;

    // generate feedback to the soul for how its behavior should change
    const [, thought] = await internalMonologue(
      step, 
      {
        instructions: "Reflect on these intuitions and how they are changing your behavior.", 
        verb: "thinks",
      },
      { model: "quality" }
    );
    log("Thought:", thought);

    // add the feedback to the initial working memory
    return finalStep.withMonologue(`${step.soulName} thinks to themself: ${thought}`);
  }

  return finalStep
}

export default influencedByTheUser

