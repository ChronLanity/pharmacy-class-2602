import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../App';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
        <h1 className="text-3xl font-bold">欢迎来到药学2602</h1>
        <p className="mt-2 text-lg opacity-90">浙江大学药学院 2026届2班</p>
        <p className="mt-4 text-sm opacity-80">
          这里是我们的班级家园，记录我们的学习生活和美好时光
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>班级简介</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              药学2602班是浙江大学药学院的本科生班级，我们是一个团结友爱、积极向上的集体。
            </p>
            <p className="text-sm text-muted-foreground">
              班级秉承"勤奋求实、创新进取"的精神，在学术研究、社会实践和文体活动中都取得了优异成绩。
            </p>
            <div className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="rounded-lg bg-accent p-4">
                  <div className="text-2xl font-bold text-primary">30</div>
                  <div className="text-xs text-muted-foreground">班级成员</div>
                </div>
                <div className="rounded-lg bg-accent p-4">
                  <div className="text-2xl font-bold text-primary">2026</div>
                  <div className="text-xs text-muted-foreground">入学年份</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>快速导航</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3">
              <a
                href="/announcements"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  📢
                </div>
                <div>
                  <div className="font-medium">班级公告</div>
                  <div className="text-xs text-muted-foreground">查看最新通知和公告</div>
                </div>
              </a>
              <a
                href="/activities"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  📸
                </div>
                <div>
                  <div className="font-medium">活动相册</div>
                  <div className="text-xs text-muted-foreground">记录精彩瞬间</div>
                </div>
              </a>
              <a
                href="/resources"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  📚
                </div>
                <div>
                  <div className="font-medium">学习资料</div>
                  <div className="text-xs text-muted-foreground">共享学习资源</div>
                </div>
              </a>
              <a
                href="/classmates"
                className="flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  👥
                </div>
                <div>
                  <div className="font-medium">同学录</div>
                  <div className="text-xs text-muted-foreground">查看班级成员</div>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>班级口号</CardTitle>
        </CardHeader>
        <CardContent>
          <blockquote className="border-l-4 border-primary pl-4 italic text-lg text-muted-foreground">
            "药济天下，学无止境"
          </blockquote>
          <p className="mt-2 text-sm text-muted-foreground">
            我们以药为业，以学为本，立志为医药事业贡献力量
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
