'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { generator, interviewer } from '@/constants';
import { createFeedback } from '@/lib/actions/general.action';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

interface AgentProps {
  userName: string;
  userId: string;
  type: 'generate' | 'interview';
  interviewId?: string;
  questions?: string[];
}

interface SavedMessage {
  role: 'user' | 'system' | 'assistant';
  content: string;
}

interface Message {
  type: string;
  transcriptType?: string;
  transcript?: string;
  role: 'user' | 'system' | 'assistant';
}

const Agent = ({ userName, userId, type, interviewId, questions }: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === 'transcript' && message.transcriptType === 'final') {
        const newMessage = { role: message.role, content: message.transcript! };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = (error: Error) => console.log('Error', error);

    vapi.on('call-start', onCallStart);
    vapi.on('call-end', onCallEnd);
    vapi.on('message', onMessage);
    vapi.on('speech-start', onSpeechStart);
    vapi.on('speech-end', onSpeechEnd);
    vapi.on('error', onError);

    return () => {
      vapi.off('call-start', onCallStart);
      vapi.off('call-end', onCallEnd);
      vapi.off('message', onMessage);
      vapi.off('speech-start', onSpeechStart);
      vapi.off('speech-end', onSpeechEnd);
      vapi.off('error', onError);
    };
  }, []);

  const handleGenerateFeedback = async (messages: SavedMessage[]) => {
    const { success, feedbackId: id } = await createFeedback({
      interviewId: interviewId!,
      userId: userId!,
      transcript: messages,
    });

    if (success && id) {
      router.push(`/interview/${interviewId}/feedback`);
    } else {
      console.log('Error saving feedback');
      router.push('/');
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === 'generate') {
        router.push('/');
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    if (type === 'generate') {
      await vapi.start(
        undefined,
        {
          variableValues: {
            username: userName,
            userid: userId,
          },
          clientMessages: ['transcript'],
          serverMessages: [],
        },
        generator
      );
    } else {
      let formattedQuestions = '';

      if (questions) {
        formattedQuestions = questions.map((q) => `- ${q}`).join('\n');
      }

      await vapi.start(interviewer, {
        variableValues: {
          questions: formattedQuestions,
        },
        clientMessages: ['transcript'],
        serverMessages: [],
      });
    }
  };

  return (
    <div>
      <button onClick={handleCall} disabled={callStatus !== CallStatus.INACTIVE}>
        Start {type === 'generate' ? 'Interview Setup' : 'Interview'}
      </button>
      <p>Call Status: {callStatus}</p>
      <p>{isSpeaking ? 'Agent is speaking...' : 'Agent is silent'}</p>
    </div>
  );
};

export default Agent;
