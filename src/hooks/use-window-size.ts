'use client';
import { useState, useEffect } from "react";

export default function useWindowSize() {
    const [width, setWidth]   = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
    useEffect(() => {
        setHeight(window.innerHeight);
        setWidth(window.innerWidth);
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);

    return { width, height};
}