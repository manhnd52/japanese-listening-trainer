import { useState, useEffect } from 'react';
import { DashboardStats } from '@/types/types';
import { statsApi } from '../api'; 

export const useStats = () => {
  const [period, setPeriod] = useState<'Week' | 'Month' | 'All'>('Week');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const response = await statsApi.getStats();

        if (response.data.success) {
          const apiData = response.data.data;
          const formatTime = (minutes: number) => {
            const h = Math.floor(minutes / 60);
            const m = minutes % 60;
            return `${h} h ${m} m`;
          };

          const transformedData: DashboardStats = {
            period: period,
            
            cards: [
              { 
                label: 'TIME SPENT', 
                value: formatTime(apiData.totalTime), 
                icon: 'clock' 
              },
              { 
                label: 'TOTAL LISTENED', 
                value: apiData.totalListened, 
                unit: 'tracks', 
                icon: 'activity' 
              },
              { 
                label: 'CURRENT STREAK', 
                value: apiData.streak, 
                unit: 'days', 
                icon: 'lightning' 
              },
              { 
                label: 'ACCURACY', 
                value: `${apiData.quizAccuracy}%`, 
                subValue: `${apiData.totalCorrectQuizzes} Correct Answers`, 
                icon: 'trophy' 
              },
            ],

            activity: apiData.activity,
            heatmap: apiData.heatmap,
            
            quizStats: {
              correct: apiData.quizAccuracy,
              wrong: 100 - apiData.quizAccuracy,
              totalCorrect: apiData.quizStats.totalCorrect 
            }
          };

          setData(transformedData);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [period]); 

  return {
    data,
    period,
    setPeriod,
    isLoading
  };
};