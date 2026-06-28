# app/services/ai_service.py
import json
import logging

from openai import AsyncOpenAI
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.ai_insight import AIInsight
from app.models.interaction import Interaction

logger = logging.getLogger("app.services.ai")

SYSTEM_PROMPT = """You are a CRM AI assistant that analyzes sales interaction notes.
Given the interaction details, produce a JSON object with exactly these keys:

- "summary": a concise 2-3 sentence summary of the interaction
- "sentiment": one of "positive", "neutral", or "negative"
- "action_items": a list of concrete follow-up actions (strings), may be empty
- "risks": a list of identified risks or concerns (strings), may be empty

Respond ONLY with valid JSON. No markdown, no explanation."""


async def generate_ai_insight(
    interaction: Interaction,
    db: AsyncSession,
) -> AIInsight:
    """
    Call OpenAI to analyse an interaction's notes and persist the resulting
    AIInsight row.  Returns the created AIInsight regardless of success/failure.
    """
    # Create pending insight row first
    insight = AIInsight(
        interaction_id=interaction.id,
        status="pending",
    )
    db.add(insight)
    await db.flush()

    if not settings.OPENAI_API_KEY:
        logger.warning("OPENAI_API_KEY not configured — skipping AI insight generation")
        insight.status = "failed"
        insight.error_message = "OPENAI_API_KEY not configured"
        await db.commit()
        await db.refresh(insight)
        return insight

    user_prompt = (
        f"Interaction type: {interaction.type}\n"
        f"Title: {interaction.title}\n"
        f"Notes:\n{interaction.notes}"
    )

    try:
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=1024,
            response_format={"type": "json_object"},
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)

        insight.summary = data.get("summary")
        insight.sentiment = data.get("sentiment")
        insight.action_items = data.get("action_items", [])
        insight.risks = data.get("risks", [])
        insight.status = "success"

        logger.info(
            f"AI insight generated for interaction {interaction.id} — "
            f"sentiment={insight.sentiment}"
        )

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse OpenAI response for interaction {interaction.id}: {e}")
        insight.status = "failed"
        insight.error_message = f"JSON parse error: {str(e)}"

    except Exception as e:
        logger.error(f"OpenAI call failed for interaction {interaction.id}: {e}", exc_info=True)
        insight.status = "failed"
        insight.error_message = str(e)[:500]

    await db.commit()
    await db.refresh(insight)
    return insight
