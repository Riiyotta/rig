(function(){const w=`
    attribute vec2 a_position;
    void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
`,y=`
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_pixelSize;
    uniform float u_speed;
    uniform float u_scale;
    uniform float u_threshold;
    uniform float u_warp;
    uniform float u_contrast;
    uniform float u_angle;
    uniform float u_vignette;
    uniform float u_mouseInfluence;
    uniform float u_glow;
    uniform float u_vertFade;
    uniform float u_fadeTop;
    uniform float u_fadeBottom;
    uniform int u_baseShape;
    uniform int u_renderMode;
    uniform float u_lineCount;
    uniform float u_lineWeight;
    uniform vec3 u_fgColor;
    uniform vec3 u_bgColor;
    uniform int u_ditherType;
    uniform int u_octaves;
    uniform int u_invert;
    uniform vec2 u_mouse;
    uniform vec3 u_mouseColor;
    uniform float u_mouseRadius;

    vec3 mod289v3(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec2 mod289v2(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289v3(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                           -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289v2(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
    }

    float hash(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
    }

    vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return fract(sin(p) * 43758.5453);
    }

    float voronoi(vec2 p, float t) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        float minDist = 1.0;
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                vec2 neighbor = vec2(float(x), float(y));
                vec2 pt = hash2(i + neighbor);
                pt = 0.5 + 0.5 * sin(t * 0.8 + 6.2832 * pt);
                vec2 diff = neighbor + pt - f;
                minDist = min(minDist, length(diff));
            }
        }
        return minDist;
    }

    float bayer2(vec2 pos) {
        int x = int(mod(pos.x, 2.0));
        int y = int(mod(pos.y, 2.0));
        int idx = x + y * 2;
        if (idx == 0) return 0.0/4.0;
        if (idx == 1) return 2.0/4.0;
        if (idx == 2) return 3.0/4.0;
        if (idx == 3) return 1.0/4.0;
        return 0.0;
    }

    float bayer4(vec2 pos) {
        int x = int(mod(pos.x, 4.0));
        int y = int(mod(pos.y, 4.0));
        int idx = x + y * 4;
        if (idx == 0) return 0.0/16.0;
        if (idx == 1) return 8.0/16.0;
        if (idx == 2) return 2.0/16.0;
        if (idx == 3) return 10.0/16.0;
        if (idx == 4) return 12.0/16.0;
        if (idx == 5) return 4.0/16.0;
        if (idx == 6) return 14.0/16.0;
        if (idx == 7) return 6.0/16.0;
        if (idx == 8) return 3.0/16.0;
        if (idx == 9) return 11.0/16.0;
        if (idx == 10) return 1.0/16.0;
        if (idx == 11) return 9.0/16.0;
        if (idx == 12) return 15.0/16.0;
        if (idx == 13) return 7.0/16.0;
        if (idx == 14) return 13.0/16.0;
        if (idx == 15) return 5.0/16.0;
        return 0.0;
    }

    float bayer8(vec2 pos) {
        float b4 = bayer4(pos);
        float b2 = bayer2(pos * 0.5);
        return b4 * 0.25 + b2 * 0.75;
    }

    float halftone(vec2 pos) {
        vec2 c = mod(pos, 4.0) - 2.0;
        return length(c) / 2.828;
    }

    float lineDither(vec2 pos) {
        return fract(pos.y * 0.5);
    }

    float blueNoise(vec2 pos) {
        return hash(pos);
    }

    float getDither(vec2 pos) {
        if (u_ditherType == 0) return bayer2(pos);
        if (u_ditherType == 1) return bayer4(pos);
        if (u_ditherType == 2) return bayer8(pos);
        if (u_ditherType == 3) return halftone(pos);
        if (u_ditherType == 4) return lineDither(pos);
        if (u_ditherType == 5) return blueNoise(pos);
        return bayer4(pos);
    }

    void main() {
        vec2 pixel = floor(gl_FragCoord.xy / u_pixelSize);
        vec2 uv = pixel * u_pixelSize / u_resolution;

        float rad = u_angle * 3.14159265 / 180.0;
        vec2 flow = vec2(cos(rad), sin(rad));
        float t = u_time * u_speed;

        vec2 muv = u_mouse;
        float mouseDist = length(uv - muv);
        float mouseEffect = u_mouseInfluence * smoothstep(0.4, 0.0, mouseDist) * 0.5;

        float warpX = snoise(uv * u_scale * 1.5 + flow * t * 0.3) * u_warp;
        float warpY = snoise(uv * u_scale * 1.5 + flow.yx * t * 0.3 + vec2(5.2, 1.3)) * u_warp;
        vec2 warped = uv + vec2(warpX, warpY);

        vec2 st = warped * u_scale + flow * t * 0.2;

        float n;

        if (u_baseShape == 0) {
            n = snoise(st);
            float amp = 0.5;
            float freq = 2.0;
            if (u_octaves >= 2) {
                n += amp * snoise(st * freq + flow * t * -0.15 + vec2(3.7, 8.1));
                amp *= 0.5; freq *= 2.0;
            }
            if (u_octaves >= 3) {
                n += amp * snoise(st * freq + flow * t * 0.1 + vec2(7.3, 2.9));
                amp *= 0.5; freq *= 2.0;
            }
            if (u_octaves >= 4) {
                n += amp * snoise(st * freq + flow * t * -0.08 + vec2(1.1, 5.5));
            }
            n = n * 0.5 + 0.5;
        } else if (u_baseShape == 1) {
            n = voronoi(st, u_time);
        } else if (u_baseShape == 2) {
            vec2 center = (warped - 0.5) * u_scale;
            n = fract(length(center) * 3.0 - t * 0.5);
        } else if (u_baseShape == 3) {
            float wave = sin(st.x * 6.2832 + sin(st.y * 3.0) * 1.5);
            n = wave * 0.5 + 0.5;
        } else if (u_baseShape == 4) {
            vec2 center = (warped - 0.5) * u_scale;
            float a = atan(center.y, center.x);
            float d = length(center);
            n = fract(d * 2.5 - a / 6.2832 * 3.0 - t * 0.3);
        } else if (u_baseShape == 5) {
            n = sin(st.x * 3.0) + sin(st.y * 3.0) + sin((st.x + st.y) * 2.0) + sin(length(st) * 3.0);
            n = n * 0.125 + 0.5;
        } else if (u_baseShape == 6) {
            vec2 d = fract(st) - 0.5;
            n = 1.0 - (abs(d.x) + abs(d.y)) * 2.0;
        } else if (u_baseShape == 7) {
            vec2 center = (warped - 0.5) * u_scale;
            float d = length(center);
            n = sin(d * 12.0 - t * 3.0) * 0.5 + 0.5;
        } else {
            float numRows = u_lineCount;
            float wy = warped.y * numRows;
            float rowIdx = floor(wy);
            float rowFract = fract(wy);

            float bw = u_lineWeight;
            float bandMask = smoothstep(0.0, 0.04, rowFract) * smoothstep(bw, bw - 0.04, rowFract);

            float segX = warped.x * u_scale * 3.0 + flow.x * t * 0.5;
            float seg = snoise(vec2(segX, rowIdx * 0.37 + t * 0.05));
            seg += 0.35 * snoise(vec2(segX * 2.5, rowIdx * 0.71 + 3.3));
            seg = seg * 0.5 + 0.5;

            float rowDensity = snoise(vec2(rowIdx * 0.23, t * 0.03 + 5.7)) * 0.3 + 0.7;

            n = bandMask * seg * rowDensity;
        }

        n += mouseEffect;

        if (u_vignette > 0.0) {
            vec2 vc = uv - 0.5;
            float vd = length(vc) * 2.0;
            float vf = smoothstep(0.0, 1.0, vd);
            n = mix(n, n * (1.0 - vf), u_vignette);
        }

        if (u_fadeTop > 0.0) {
            n *= smoothstep(u_fadeTop, u_fadeTop + 0.02, 1.0 - uv.y);
        }
        if (u_fadeBottom > 0.0) {
            n *= smoothstep(u_fadeBottom, u_fadeBottom + 0.02, uv.y);
        }

        if (u_vertFade > 0.0) {
            n *= mix(1.0, pow(uv.y, 2.0), u_vertFade);
        }

        float n_pre = n;

        float result;
        if (u_renderMode == 1) {
            float contourVal = fract(n * u_lineCount);
            float lineDist = min(contourVal, 1.0 - contourVal) * 2.0;
            float lineMask = 1.0 - smoothstep(0.0, u_lineWeight, lineDist);

            float dither = getDither(pixel);
            result = step(dither, lineMask);
        } else {
            float edge = (1.0 - u_contrast) * 0.8;
            n = smoothstep(u_threshold - edge, u_threshold + edge, n);
            float dither = getDither(pixel);
            result = step(dither, n);
        }

        if (u_invert == 1) result = 1.0 - result;

        float mDist = length(uv - u_mouse);
        float mBlend = smoothstep(u_mouseRadius, u_mouseRadius * 0.65, mDist);
        vec3 bg = mix(u_bgColor, u_mouseColor, mBlend);
        vec3 fg = u_fgColor;
        vec3 color = mix(bg, fg, result);

        if (u_glow > 0.0) {
            float glowZone;
            if (u_renderMode == 1) {
                float cv = fract(n_pre * u_lineCount);
                float ld = min(cv, 1.0 - cv) * 2.0;
                glowZone = 1.0 - smoothstep(0.0, u_lineWeight * 4.0, ld);
            } else {
                float density = abs(n_pre - u_threshold);
                glowZone = smoothstep(0.35, 0.0, density);
            }
            vec3 glowTint = fg * 1.5 + vec3(0.1, 0.05, 0.0);
            color += glowTint * glowZone * u_glow * 0.18;
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;function p(n,i,e){const a=n.createShader(i);return n.shaderSource(a,e),n.compileShader(a),n.getShaderParameter(a,n.COMPILE_STATUS)?a:(console.error("Shader compile error:",n.getShaderInfoLog(a)),n.deleteShader(a),null)}function h(n){return[parseInt(n.substr(1,2),16)/255,parseInt(n.substr(3,2),16)/255,parseInt(n.substr(5,2),16)/255]}const v={baseShape:8,ditherType:4,pixelSize:14,speed:.06,scale:.4,threshold:.62,warp:.12,contrast:.75,angle:261,vignette:0,glow:.6,octaves:4,fadeTop:0,fadeBottom:0,vertFade:.7,renderMode:1,lineCount:17,lineWeight:.16,invert:0,mouseInfluence:0},m={baseShape:8,ditherType:4,pixelSize:8,speed:.25,scale:1.3,threshold:.11,warp:.12,contrast:.75,angle:238,vignette:0,glow:.6,octaves:4,fadeTop:0,fadeBottom:0,vertFade:.7,renderMode:1,lineCount:2,lineWeight:.12,invert:0,mouseInfluence:0},_={shader1:{config:v,fg:"#0A0A0A",bg:"#121212"},shader2:{config:m,fg:"#000000",bg:"#ed462d"},shader3:{config:m,fg:"#000000",bg:"#ed462d"}},l=[];window._shaderActivePanel=0,window._shaderNeedsResize=!1,window._shaderDefs=_;const c={};window._shaderConfigs={howShader:v,introShader:m},["shader1","shader2","shader3"].forEach(function(n){const i=document.getElementById(n);if(!i)return;const e=i.getContext("webgl",{antialias:!1,alpha:!1});if(!e)return;const a=p(e,e.VERTEX_SHADER,w),o=p(e,e.FRAGMENT_SHADER,y);if(!a||!o)return;const t=e.createProgram();if(e.attachShader(t,a),e.attachShader(t,o),e.linkProgram(t),!e.getProgramParameter(t,e.LINK_STATUS)){console.error("Program link error:",e.getProgramInfoLog(t));return}e.useProgram(t);const r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW);const u=e.getAttribLocation(t,"a_position");e.enableVertexAttribArray(u),e.vertexAttribPointer(u,2,e.FLOAT,!1,0,0);const f={};["u_resolution","u_time","u_pixelSize","u_speed","u_scale","u_threshold","u_warp","u_contrast","u_angle","u_vignette","u_fadeTop","u_fadeBottom","u_mouseInfluence","u_glow","u_vertFade","u_baseShape","u_renderMode","u_lineCount","u_lineWeight","u_fgColor","u_bgColor","u_ditherType","u_octaves","u_invert","u_mouse","u_mouseColor","u_mouseRadius"].forEach(d=>{f[d]=e.getUniformLocation(t,d)});const s=_[n];l.push({canvas:i,gl:e,program:t,uniforms:f,config:s.config,fgColor:h(s.fg),bgColor:h(s.bg)})}),"IntersectionObserver"in window?l.forEach((n,i)=>{const e=n.canvas.closest("section");if(!e){c[i]=!0;return}c[i]=!1,new IntersectionObserver(a=>{c[i]=a[0].isIntersecting},{threshold:0,rootMargin:"200px 0px"}).observe(e)}):l.forEach((n,i)=>{c[i]=!0});function g(n){const i=n*.001;l.forEach((e,a)=>{if(!c[a])return;const{gl:o,uniforms:t,config:r,canvas:u}=e,f=u.parentElement.getBoundingClientRect();if(f.width===0||f.height===0)return;const s=Math.min(window.devicePixelRatio||1,2),d=Math.round(f.width*s),x=Math.round(f.height*s);(u.width!==d||u.height!==x)&&(u.width=d,u.height=x),o.viewport(0,0,u.width,u.height),o.uniform2f(t.u_resolution,u.width,u.height),o.uniform1f(t.u_time,i),o.uniform1f(t.u_pixelSize,r.pixelSize*s),o.uniform1f(t.u_speed,r.speed),o.uniform1f(t.u_scale,r.scale),o.uniform1f(t.u_threshold,r.threshold),o.uniform1f(t.u_warp,r.warp),o.uniform1f(t.u_contrast,r.contrast),o.uniform1f(t.u_angle,r.angle),o.uniform1f(t.u_vignette,r.vignette),o.uniform1f(t.u_fadeTop,r.fadeTop),o.uniform1f(t.u_fadeBottom,r.fadeBottom),o.uniform1f(t.u_mouseInfluence,r.mouseInfluence||0),o.uniform1f(t.u_glow,r.glow),o.uniform1f(t.u_vertFade,r.vertFade),o.uniform1i(t.u_baseShape,r.baseShape),o.uniform1i(t.u_renderMode,r.renderMode),o.uniform1f(t.u_lineCount,r.lineCount),o.uniform1f(t.u_lineWeight,r.lineWeight),o.uniform3fv(t.u_fgColor,e.fgColor),o.uniform3fv(t.u_bgColor,e.bgColor),o.uniform1i(t.u_ditherType,r.ditherType),o.uniform1i(t.u_octaves,r.octaves),o.uniform1i(t.u_invert,r.invert||0),o.uniform2f(t.u_mouse,window._shaderMouse?window._shaderMouse[0]:-1,window._shaderMouse?window._shaderMouse[1]:-1),o.uniform3fv(t.u_mouseColor,h("#ED462D")),o.uniform1f(t.u_mouseRadius,.25),o.drawArrays(o.TRIANGLE_STRIP,0,4)}),requestAnimationFrame(g)}l.length>0&&requestAnimationFrame(g),(function(){var n=[{wrap:".intro-headline-wrap",section:"#intro-rig",shader:".intro-shader-wrap",extraPad:50},{wrap:".ea-headline-wrap",section:"#early-access",shader:".shader-wrap",extraPad:40}];function i(){n.forEach(function(e){var a=document.querySelector(e.section+" "+e.wrap),o=document.querySelector(e.section),t=o&&o.querySelector(e.shader);if(!(!a||!o||!t)){var r=o.getBoundingClientRect(),u=a.getBoundingClientRect(),f=parseFloat(getComputedStyle(document.documentElement).fontSize)*.5,s=f+e.extraPad;t.style.top=u.top-r.top-s+"px",t.style.height=u.height+s*2+"px"}})}i(),window.addEventListener("resize",i),window.addEventListener("load",i)})(),window._shaderMouse=null,[".how-illustration","#early-access"].forEach(function(n){var i=document.querySelector(n);i&&(i.addEventListener("mousemove",function(e){var a=i.getBoundingClientRect();window._shaderMouse=[(e.clientX-a.left)/a.width,1-(e.clientY-a.top)/a.height]}),i.addEventListener("mouseleave",function(){window._shaderMouse=null}))})})();
