import { startConsumer } from "./consumer";
import { startAnalysisConsumer } from "./analysisConsumer";

// Start regular update consumers
for (let i = 0; i < 10; i++) {
    startConsumer();
}

// Start analysis consumers
for (let i = 0; i < 5; i++) {
    startAnalysisConsumer();
}