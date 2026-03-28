import { useState, useRef } from "react";

export default function useAudioSystem() {
    const [beat, setBeat] = useState("off")
    const musicRef = useRef(null)

    function musicOff() {
        if (musicRef.current) {
            musicRef.current.pause();
            musicRef.current.currentTime = 0;
            musicRef.current = null;
        }
    }

    function resetMusic() {
        if (musicRef.current) {
           musicRef.current.pause();
           musicRef.current.currentTime = 0;
        }
    }

    function playMusic(track) {

        if (musicRef.current) {
            musicRef.current.pause();
        }

        const audio = new Audio(track);
        audio.loop = true;
        audio.volume = 0.6;

        audio.play();

        musicRef.current = audio;
    }

    function restartMusic() {
        if (musicRef.current) {
            musicRef.current.currentTime = 0;
            musicRef.current.volume = 0.5;
            musicRef.current.play();
        }
    }

    function fadeOutMusic(duration = 800) {
        const audio = musicRef.current;
        if (!audio) return;

        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = audio.volume / steps;

        let currentStep = 0;

        const fade = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(0, audio.volume - volumeStep);

        if (currentStep >= steps) {
            clearInterval(fade);
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 0.7; // reset for next game
        }
        }, stepTime);
    }

    return {
        beat, 
        setBeat,
        musicRef,
        musicOff,
        resetMusic,
        playMusic,
        restartMusic,
        fadeOutMusic,
    }
}