'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface WeatherCondition {
  text: string;
  icon: string;
}

interface CurrentWeather {
  temp_c: number;
  condition: WeatherCondition;
}

interface LocationInfo{
  name: string;
  country: string;
}

interface WeatherData{
  location: LocationInfo;
  current: CurrentWeather;
}

export default function WeatherPage(){
  const [weather,setWeather ] = useState< WeatherData| null>(null);
  const [ error, setError ] = useState<string>('');
  const [ loading, setLoading ] = useState<boolean>(true);

  useEffect(()=>{
    const fetchWeather = async ( latitude: number, longitude: number ) =>{
      try{
        const apiKey =  "0542dc8c01984eafb99135346253005";
        const response = await axios.get<WeatherData>('http://api.weatherapi.com/v1/current.json',{
          params: {
            key : apiKey,
            q: `${latitude},${longitude}`,
          },
        });
        setWeather( response.data );

      }catch(err:any){
        console.error(err);
        setError('Failed to fetch weather data.');
      }finally{
         setLoading(false);
      }
    };
    if ( navigator.geolocation){
       navigator.geolocation.getCurrentPosition(
        ( position ) =>{
          const { latitude, longitude } = position.coords;
          fetchWeather( latitude, longitude );
        },
        (err) => {
          console.error(err);
          setError("Location access denied or unavailable");
          setLoading(false);
        }
       );

    }else {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
    }

  },[]);

  return (
    <div style={{ padding:'20px'}}>
      <h1> Weather Info (Local) </h1>
      {loading && <p> loading weather data...</p>}
      {error && <p style ={{ color:'red'}}>{error}</p>}
      { weather && (
        <div>
          <h2>{ weather.location.name}, {weather.location.country}</h2>
          <p>Temperature: {weather.current.temp_c}°C</p>
          <p>Condition: {weather.current.condition.text}</p>
          <img src ={weather.current.condition.icon} alt = {weather.current.condition.text} />
           </div>
      )}
    </div>
  );
}