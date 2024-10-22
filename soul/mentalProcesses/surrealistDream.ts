import { MentalProcess, ChatMessageRoleEnum, useActions, useProcessManager, indentNicely, useSoulMemory, useProcessMemory, WorkingMemory, createCognitiveStep } from "@opensouls/engine";
import internalDialog from "../cognitiveSteps/internalDialog";
import internalMonologue from "../cognitiveSteps/internalMonologue";
import decision from "../cognitiveSteps/decision";
import dreamQuery from "../cognitiveSteps/dreamQuery";
import soulSheds from "../mentalProcesses/soulSheds";

  const surrealDream: MentalProcess = async ({ workingMemory: initialStep }) => {
    const { speak, log, dispatch  } = useActions()
    const dreamModel = useSoulMemory("dreamModel")
    const dreamTime = useSoulMemory("dreamTime", 1)
    const userName = useSoulMemory("userName")
    const userModel = useSoulMemory("userModel")
    const soulBlueprint = useSoulMemory("soulBlueprint")
    const melatoninCounter = useProcessMemory(0)
    const { wait } = useProcessManager()
    const { invocationCount } = useProcessManager()
    const selectedScene = useProcessMemory("selectedScene")

    let step = initialStep
    let finalStep = initialStep
    let stream

    step = step.withMemory({
        role: ChatMessageRoleEnum.System,
        content: `${step.soulName} finds herself in this ${dreamModel.current}, although she's unaware that she's dreaming, and even who she is. Subsequent messages from the user should be interpreted as external stimuli filtering into the dream and your responses should distort, reintrepret, and weave the content of the messages into an illogical, surreal dream narrative that flows from one topic to the next based on conceptual associations rather than literal meaning or intent.`
    })

// First step of the dream 

if (invocationCount === 0) {

  dispatch({
      action: "dream",
      content: "Entering dream state...",
      _metadata: {
      }
    }); 
  }

if (melatoninCounter.current < 4) {
    melatoninCounter.current += 1;
    log("Sleep counter:", melatoninCounter.current)

    let [withDialog, feeling] = await internalDialog(step,
      {
        instructions: `Where should she go, and what should she do next?`,
        verb: "ponders",
        persona: "Samantha, unaware she's dreaming"
      },
      { stream: true, model: "exp/llama-v3-70b-instruct" }
    );

      dispatch({
        action: "answers",
        content: feeling,
        _metadata: {
          // Add any relevant metadata here
        }
      });

      log("Stream-of-consciousness:", feeling);

      await wait(6000);

// Second step of the dream 

    // const [Scene1, Scene2, Scene3, Scene4] = [
    //   "Scene 1",
    //   "Scene 2",
    //   "Scene 3",
    //   "Scene 4",
    // ];
    // const [, scene] = await decision(
    //   step,
    //   {
    //     description: `Choose any of the scenes from ${dreamModel.current}, based on the recent exchanges between ${userName.current} and ${step.soulName}.`,
    //     choices: [Scene1, Scene2, Scene3, Scene4],
    //   },
    //   { model: "quality" }
    // );

    // log("Scene:", scene);
    // selectedScene.current = scene;

      [withDialog, stream] = await internalDialog(step, 
        {
          instructions: `Narrate a scene from the dream as if it were a paragraph in one of your short stories, written in 3rd person. Write 2-4 sentences MAX. Don't mention that it's a dream.`,
          verb: "echoes",
          persona: "James Joyce"
        },  
        { stream: true, model: "exp/llama-v3-70b-instruct" }
      );
      dispatch({
        action: "conjures",
        content: stream,
        _metadata: {
          // Add any relevant metadata here
        }
      });

      await wait(14000);

// Third step of the dream 

    let [, samDreams] = await dreamQuery(
        step, 
        `${step.soulName} should speak next.`
    )
    if (samDreams) {
        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${soulBlueprint.current} and the plot of the dream.`,
              verb: "riddles",
              persona: `${step.soulName}, unaware she's dreaming`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "answers",
            content: stream,
            _metadata: {
              // Add any relevant metadata here
            }
          });
    } else {

        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${userModel.current}, and the plot of the dream. Don't mention it's a dream.`,
              verb: "alludes",
              persona: `${userName.current}`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "thinks",
            content: stream,
            _metadata: {
              // Add any relevant metadata here
            }
          });
    }

    await wait(6000);

// Fourth step of the dream 

    [, samDreams] = await dreamQuery(
        step, 
        `${userName.current} should speak next.`
    )
    if (samDreams) {
        [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${userModel.current}, and the plot of the dream. Don't mention it's a dream.`,
              verb: "whispers",
              persona: `${userName.current}`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "thinks",
            content: stream,
            _metadata: {
              // Add any relevant metadata here
            }
          });

    } else {
          [withDialog, stream] = await internalDialog(step, 
            {
              instructions: `You are a dream character, a figment of ${step.soulName}'s sleeping mind. Your form, purpose, and dialogue are inspired by the ${soulBlueprint.current} and the plot of the dream. You don't know you're dreaming.`,
              verb: "muses",
              persona: `${step.soulName}`
            },  
            { stream: true, model: "exp/llama-v3-70b-instruct" }
          );
          dispatch({
            action: "answers",
            content: stream,
            _metadata: {
              // Add any relevant metadata here
            }
          });
    }
}
    else {
        melatoninCounter.current = 0;
        dreamTime.current = 0
        return [finalStep, soulSheds, { executeNow: true}]    

    }
    return finalStep
  }

  export default surrealDream

