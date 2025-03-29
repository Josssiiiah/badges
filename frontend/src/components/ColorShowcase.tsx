import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ColorShowcase() {
  return (
    <div className="p-8 space-y-8">
      {/* Oxford Blue Section */}
      <Card className="bg-oxford-100 border-oxford-300">
        <CardHeader>
          <CardTitle className="text-oxford-500">Oxford Blue Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div
                key={shade}
                className={`h-24 rounded-lg flex items-center justify-center bg-oxford-${shade}`}
              >
                <span className="text-pure-100">Shade {shade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Space Cadet Section */}
      <Card className="bg-space-100 border-space-300">
        <CardHeader>
          <CardTitle className="text-space-500">Space Cadet Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div
                key={shade}
                className={`h-24 rounded-lg flex items-center justify-center bg-space-${shade}`}
              >
                <span className="text-pure-100">Shade {shade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payne's Gray Section */}
      <Card className="bg-payne-100 border-payne-300">
        <CardHeader>
          <CardTitle className="text-payne-500">Payne's Gray Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div
                key={shade}
                className={`h-24 rounded-lg flex items-center justify-center bg-payne-${shade}`}
              >
                <span className="text-pure-100">Shade {shade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Slate Blue Section */}
      <Card className="bg-slate-100 border-slate-300">
        <CardHeader>
          <CardTitle className="text-slate-500">Slate Blue Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div
                key={shade}
                className={`h-24 rounded-lg flex items-center justify-center bg-slate-${shade}`}
              >
                <span className="text-pure-100">Shade {shade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pure White Section */}
      <Card className="bg-pure-100 border-pure-300">
        <CardHeader>
          <CardTitle className="text-pure-500">Pure White Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[100, 300, 500, 700, 900].map((shade) => (
              <div
                key={shade}
                className={`h-24 rounded-lg flex items-center justify-center border border-gray-200 bg-pure-${shade}`}
              >
                <span className="text-oxford-500">Shade {shade}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
