import React, { useEffect, useRef } from 'react';

interface Star {
    x: number;
    y: number;
    z: number; // Depth factor (0.1 to 1)
    size: number;
    brightness: number;
    twinkleSpeed: number;
    twinklePhase: number;
}

interface NebulaCloud {
    x: number;
    y: number;
    radius: number;
    color: string;
    vx: number;
    vy: number;
}

const StarfieldBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let stars: Star[] = [];
        let nebulae: NebulaCloud[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initSpace();
        };

        const initSpace = () => {
            // 1. Initialize Stars with Depth
            const starCount = Math.floor((window.innerWidth * window.innerHeight) / 2500);
            stars = [];
            for (let i = 0; i < starCount; i++) {
                const z = Math.random() * 0.8 + 0.2; // Depth: 0.2 (far) to 1.0 (near)
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    z: z,
                    size: Math.random() * 1.5 * z, // Far stars are smaller
                    brightness: Math.random(),
                    twinkleSpeed: Math.random() * 0.03 + 0.005,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }

            // 2. Initialize Nebula Clouds
            nebulae = [
                {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: 400,
                    color: 'rgba(76, 29, 149, 0.15)', // Deep Purple
                    vx: (Math.random() - 0.5) * 0.1,
                    vy: (Math.random() - 0.5) * 0.1
                },
                {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: 500,
                    color: 'rgba(8, 145, 178, 0.12)', // Cyan/Teal
                    vx: (Math.random() - 0.5) * 0.15,
                    vy: (Math.random() - 0.5) * 0.15
                },
                {
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: 600,
                    color: 'rgba(30, 27, 75, 0.2)', // Midnight Blue
                    vx: (Math.random() - 0.5) * 0.05,
                    vy: (Math.random() - 0.5) * 0.05
                }
            ];
        };

        const draw = () => {
            if (!ctx || !canvas) return;

            // 1. Clear & Base Background
            ctx.fillStyle = '#050510'; // Deepest space black
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Nebula Clouds
            nebulae.forEach(cloud => {
                cloud.x += cloud.vx;
                cloud.y += cloud.vy;

                // Bounce off edges (softly)
                if (cloud.x < -cloud.radius) cloud.x = canvas.width + cloud.radius;
                if (cloud.x > canvas.width + cloud.radius) cloud.x = -cloud.radius;
                if (cloud.y < -cloud.radius) cloud.y = canvas.height + cloud.radius;
                if (cloud.y > canvas.height + cloud.radius) cloud.y = -cloud.radius;

                const gradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.radius);
                gradient.addColorStop(0, cloud.color);
                gradient.addColorStop(1, 'rgba(0,0,0,0)');

                ctx.globalCompositeOperation = 'screen'; // Additive blending for glow
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // 3. Draw Stars
            ctx.globalCompositeOperation = 'source-over'; // Reset blending
            stars.forEach(star => {
                // Parallax Move: Near stars move faster (if we had camera movement), 
                // here we just drift them slowly or keep them static. 
                // Let's create a slow drift.
                star.y -= 0.05 * star.z; // Slow upward drift
                if (star.y < 0) {
                    star.y = canvas.height;
                    star.x = Math.random() * canvas.width;
                }

                // Update twinkle
                star.twinklePhase += star.twinkleSpeed;
                const twinkle = Math.sin(star.twinklePhase) * 0.4 + 0.6; // 0.2 to 1.0

                // Draw
                const opacity = star.brightness * twinkle * star.z; // Far stars are dimmer
                ctx.fillStyle = `rgba(220, 230, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        // Initial setup
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 w-full h-full pointer-events-none z-[-1]"
        />
    );
};

export default StarfieldBackground;
