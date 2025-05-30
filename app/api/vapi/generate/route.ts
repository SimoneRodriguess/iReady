import {generateText} from "ai";
import {google} from "@ai-sdk/google";
import {getRandomInterviewCover} from "@/lib/utils";
import {db} from "@/firebase/admin";

export async function GET(){
    return Response.json({success: true, data: 'Thankyou!!'}, {status:200});
}

export async function POST(request: Request){
    const{type, role, level, techstack, amount, userid }= await request.json();
    try {
       const{text: questions }= await generateText({
           model: google('gemini-2.0-flash-001'),
           prompt: `Prepare questions for a job interview

                The job role is: ${role}.
                The job experience is: ${level}.
                The tech stack used in the job is: ${techstack}.
                The focus between behavioural and technical questions should lean towards: ${type}.
                The amount of questions should be: ${amount}.
                Please return only the questions, without ANY additional text.
                The questions are going to be read by a voice assistant and so do not use "/" or "*" or any special characters that might break formatting.
                Return the questions formatted like this:
                ["Question 1", "Question 2", "Question 3"]  

                Thank you!`



       })
        const interview={
           role, type, level, techstack: techstack.split(','),
            questions: JSON.parse(questions), userId: userid, finalized: true, coverImage: getRandomInterviewCover(), createdAt: new Date().toISOString()
        }
        await db.collection("interiews").add(interview);

       return Response.json({success: true}, {status:200})
    }catch(error){
        console.error(error);
        return Response.json({success: false, error}, {status:500});

    }

}