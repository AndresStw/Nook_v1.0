import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function TestConnection() {
  const [status, setStatus] = useState("testing");
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const test = async () => {
      try {
        // Probar conexión
        const { data, error } = await supabase
          .from("interests")
          .select("*")
          .limit(5);

        if (error) throw error;

        setStatus("success");
        setDetails({
          message: "Conexión exitosa",
          interests: data,
        });
      } catch (err) {
        setStatus("error");
        setDetails({ message: err.message });
      }
    };

    test();
  }, []);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-bg-surface border border-border rounded-2xl p-6">
        <h1 className="text-xl font-bold text-text-primary mb-4">
          Test de conexión Supabase
        </h1>

        {status === "testing" && (
          <p className="text-text-secondary">Probando...</p>
        )}

        {status === "success" && (
          <div>
            <p className="text-success font-medium mb-3">
              ✅ {details.message}
            </p>
            <p className="text-xs text-text-secondary mb-2">
              Intereses cargados desde la base de datos:
            </p>
            <ul className="text-sm text-text-primary space-y-1">
              {details.interests.map((i) => (
                <li key={i.id}>
                  {i.emoji} {i.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="text-error font-medium mb-2">❌ Error</p>
            <p className="text-xs text-text-secondary">{details.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
