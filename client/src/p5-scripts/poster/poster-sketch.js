import Wire from "../visualization-page/wire";
import AudioRing from "../record-page/audio-ring";

window.SHOULD_ANIMATE = false;
const SAMPLE_TRANSCRIPT =
  "something that I really love about telling stories with either a lot of my friends or just in a large group generally is that you'll start telling a story about something you did or something you experienced and then either someone will pick up on what you said or be inspired to tell their own stories and then the conversation will just go in this entirely New Direction and you'll end up in and then place at the end of the conversation that's nowhere near where you started and I think I was reading cuz you're like I want to tell my story but I think overall it's really cool how our conversations with each other can take these really long Meandering paths";

const PosterSketch = (p) => {
  const aspectRatio = 18 / 24;
  const width = 1200;
  const height = width * aspectRatio;

  const TITLE_FONT_SIZE = 104;
  const TITLE_X_START = 75;
  const TITLE_Y_START = height / 3;
  const TITLE = "INFINITE  TELEPHONE";

  const SUBTITLE_Y_START = (height * 3) / 4;
  const SUBTITLE_FONT_SIZE = 30;
  const SUBTITLE = "all are invited to join the conversation";

  let Exo2Font, Exo2FontRegular, Exo2FontSemiBold;
  let canvas;
  let points;
  let wires = [];

  let audioRing;

  p.preload = () => {
    Exo2Font = p.loadFont("../fonts/Exo2-Bold.ttf"); // problem : won‘t work
    Exo2FontRegular = p.loadFont("../fonts/Exo2-Regular.ttf"); // problem : won‘t work
    Exo2FontSemiBold = p.loadFont("../fonts/Exo2-SemiBold.ttf"); // problem : won‘t work
  };

  p.setup = () => {
    canvas = p.createCanvas(width, height, window.p5.RendererSVG);
    p.pixelDensity(9);
    p.background(17, 17, 17);

    points = Exo2Font.textToPoints(
      TITLE,
      TITLE_X_START,
      TITLE_Y_START,
      TITLE_FONT_SIZE,
      {
        sampleFactor: 0.2,
        simplifyThreshold: 0,
      }
    );
    const transcriptWords = SAMPLE_TRANSCRIPT.split(" ");

    points.forEach((point, i) => {
      if (p.random() > 0.05) return;

      const randomIndex = Math.floor(p.random() * points.length);
      const startPoint = point;
      const endPoint = points[randomIndex];

      const start = p.createVector(startPoint.x, startPoint.y);
      const end = p.createVector(endPoint.x, endPoint.y);
      const wire = new Wire({
        start,
        end,
        weight: p.random(0, 3),
        p,
        word: transcriptWords[i % transcriptWords.length],
      });
      wires.push(wire);
    });

    const offscreenPointsCount = 20;
    const arraySlice = 150;
    const textMidpoint = TITLE_Y_START + TITLE_FONT_SIZE / 4;
    for (let i = 0; i < offscreenPointsCount; i++) {
      let start, end;
      if (i < offscreenPointsCount / 2) {
        const randomIndex = Math.floor(p.random() * arraySlice);
        const endPoint = points[randomIndex];

        start = p.createVector(
          p.random(-110, -90),
          p.random(textMidpoint - 20, textMidpoint + 20)
        );
        end = p.createVector(endPoint.x, endPoint.y);
      } else {
        const randomIndex = Math.floor(
          p.random() * arraySlice + points.length - arraySlice
        );
        const endPoint = points[randomIndex];

        start = p.createVector(
          p.random(width + 90, width + 110),
          p.random(textMidpoint - 50, textMidpoint + 50)
        );
        end = p.createVector(endPoint.x, endPoint.y);
      }

      const wire = new Wire({
        start,
        end,
        weight: p.random(0, 3),
        p,
        word: transcriptWords[i % transcriptWords.length],
      });
      wires.push(wire);
    }

    const startPoint = points[20];
    const endPoint = points[points.length - 50];

    const start = p.createVector(startPoint.x, startPoint.y);
    const end = p.createVector(endPoint.x, endPoint.y);
    const wire = new Wire({
      start,
      end,
      weight: 2.5, //p.random(0, 3),
      p,
      word: transcriptWords[25],
    });
    wires.push(wire);

    // const audioRingPosition = p.createVector(width / 2, height / 10);
    // audioRing = new AudioRing({
    //   p,
    //   maxRadius: height / 10,
    //   position: audioRingPosition,
    // });
  };

  p.draw = () => {
    p.clear();
    p.background(17);
    p.blendMode(p.ADD);

    // p.background(17, 17, 17);
    p.noStroke();
    // p.fill(238, 218, 214, 50);
    p.textSize(TITLE_FONT_SIZE);
    p.textFont(Exo2Font);
    p.text(TITLE, TITLE_X_START, TITLE_Y_START);

    p.fill(238, 218, 214);
    p.textSize(SUBTITLE_FONT_SIZE);
    p.textFont(Exo2FontSemiBold);

    p.fill(200, 100, 150);
    const bbox = Exo2FontSemiBold.textBounds(
      SUBTITLE.toUpperCase(),
      0,
      0,
      SUBTITLE_FONT_SIZE
    );
    const subtitleWidth = bbox.w;
    const subtitleXStart = (width - subtitleWidth) / 2;

    p.text(SUBTITLE.toUpperCase(), subtitleXStart + 2, SUBTITLE_Y_START + 2);
    p.fill(238, 218, 214);
    p.text(SUBTITLE.toUpperCase(), subtitleXStart, SUBTITLE_Y_START);

    wires.forEach((wire) => {
      wire.update();
      wire.draw(p);
    });

    p.noFill();
    p.strokeWeight(3);
    p.stroke(200);

    p.blendMode(p.BLEND);
    points.forEach((point) => {
      p.circle(point.x, point.y, 1);
    });
  };

  p.mouseClicked = () => {
    console.log("Save image");
    p.save(canvas, "myImage.png");
  };
};

export default PosterSketch;
