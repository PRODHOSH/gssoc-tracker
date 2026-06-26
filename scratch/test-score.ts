import { _buildAdminScore } from "../src/lib/admin-scoring";

async function main() {
  try {
    const score = await _buildAdminScore("ixotic27", "the-leetcode-city", "ixotic27");
    console.log("SCORE BREAKDOWN:", JSON.stringify(score, null, 2));
  } catch (err) {
    console.error("ERROR:", err);
  }
}

main();
