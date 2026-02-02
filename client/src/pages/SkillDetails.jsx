import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getSkill } from "@/api/skillsApi"; // may need to create this

export default function SkillDetails({ skills }) {
  const { id } = useParams();
  const numericId = Number(id);

  const fromList = useMemo(() => {
    if (!Array.isArray(skills)) return null;
    return skills.find((s) => Number(s.id) === numericId) ?? null;
  }, [skills, numericId]);

  const [skill, setSkill] = useState(fromList);
  const [loading, setLoading] = useState(!fromList);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // if already in list, no need to fetch
      if (fromList) {
        setSkill(fromList);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getSkill(numericId); // calls backend
        if (!cancelled) setSkill(data);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (Number.isFinite(numericId)) load();

    return () => {
      cancelled = true;
    };
  }, [numericId, fromList]);

  if (!Number.isFinite(numericId)) {
    return <div className="p-6">Invalid skill id</div>;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // If backend says 404, getSkill should throw something I can detect.
  if (!skill) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold">Skill not found</h2>
        <p className="text-muted-foreground mt-2">
          This skill is not in the database.
        </p>
        <Link to="/skills" className="underline mt-4 inline-block">
          Back to Skills
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">{skill.name}</h1>
      <div className="mt-2 text-muted-foreground">
        Category: {skill.category ?? "—"}
      </div>
      <div className="mt-2 text-muted-foreground">
        Decay: {skill.decay_score ?? "—"}
      </div>
    </div>
  );
}
