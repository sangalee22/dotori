import ActivityKit
import WidgetKit
import SwiftUI

// MARK: - 공통 헬퍼

@available(iOS 16.2, *)
private func formattedElapsed(_ seconds: Int) -> String {
    let h = seconds / 3600
    let m = (seconds % 3600) / 60
    let s = seconds % 60
    if h > 0 {
        return String(format: "%d:%02d:%02d", h, m, s)
    }
    return String(format: "%02d:%02d", m, s)
}

// MARK: - 잠금화면 뷰

@available(iOS 16.2, *)
struct TimerLockScreenView: View {
    let context: ActivityViewContext<TimerActivityAttributes>

    private var timerStartDate: Date {
        Date(timeIntervalSince1970: context.state.timerStartTimestamp)
    }

    var body: some View {
        HStack(spacing: 14) {
            // 책 아이콘
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color(red: 0.96, green: 0.91, blue: 0.83))
                    .frame(width: 44, height: 44)
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 22))
                    .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
            }

            VStack(alignment: .leading, spacing: 3) {
                Text(context.attributes.bookTitle)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                if context.state.isPlaying {
                    Text(timerInterval: timerStartDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.system(size: 26, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                } else {
                    Text(formattedElapsed(context.state.elapsedSeconds))
                        .monospacedDigit()
                        .font(.system(size: 26, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                }
            }

            Spacer()

            Image(systemName: context.state.isPlaying ? "pause.circle.fill" : "play.circle.fill")
                .font(.system(size: 30))
                .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
                .symbolRenderingMode(.hierarchical)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}

// MARK: - 다이나믹 아일랜드 확장 뷰

@available(iOS 16.2, *)
struct TimerIslandExpandedView: View {
    let context: ActivityViewContext<TimerActivityAttributes>

    private var timerStartDate: Date {
        Date(timeIntervalSince1970: context.state.timerStartTimestamp)
    }

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "book.closed.fill")
                .font(.system(size: 20))
                .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))

            VStack(alignment: .leading, spacing: 2) {
                Text(context.attributes.bookTitle)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(.secondary)
                    .lineLimit(1)

                if context.state.isPlaying {
                    Text(timerInterval: timerStartDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                } else {
                    Text(formattedElapsed(context.state.elapsedSeconds))
                        .monospacedDigit()
                        .font(.system(size: 20, weight: .bold, design: .rounded))
                        .foregroundColor(.primary)
                }
            }

            Spacer()

            Image(systemName: context.state.isPlaying ? "pause.fill" : "play.fill")
                .font(.system(size: 18))
                .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
        }
        .padding(.horizontal, 8)
    }
}

// MARK: - 위젯 정의

@available(iOS 16.2, *)
struct TimerLiveActivityWidget: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: TimerActivityAttributes.self) { context in
            // 잠금화면 / 홈화면 배너
            TimerLockScreenView(context: context)
                .activityBackgroundTint(Color(red: 0.98, green: 0.95, blue: 0.89))
                .activitySystemActionForegroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))

        } dynamicIsland: { context in
            DynamicIsland {
                // 확장된 상태 (길게 누를 때)
                DynamicIslandExpandedRegion(.leading) {
                    Image(systemName: "book.closed.fill")
                        .font(.system(size: 18))
                        .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
                        .padding(.leading, 4)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Image(
                        systemName: context.state.isPlaying ? "pause.fill" : "play.fill"
                    )
                    .font(.system(size: 16))
                    .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
                    .padding(.trailing, 4)
                }
                DynamicIslandExpandedRegion(.center) {
                    VStack(spacing: 2) {
                        Text(context.attributes.bookTitle)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.secondary)
                            .lineLimit(1)
                    }
                }
                DynamicIslandExpandedRegion(.bottom) {
                    let timerStartDate = Date(timeIntervalSince1970: context.state.timerStartTimestamp)
                    if context.state.isPlaying {
                        Text(timerInterval: timerStartDate...Date.distantFuture, countsDown: false)
                            .monospacedDigit()
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                    } else {
                        Text(formattedElapsed(context.state.elapsedSeconds))
                            .monospacedDigit()
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(.primary)
                    }
                }
            } compactLeading: {
                // 작은 알약 왼쪽: 책 아이콘
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 13))
                    .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
            } compactTrailing: {
                // 작은 알약 오른쪽: 타이머
                let timerStartDate = Date(timeIntervalSince1970: context.state.timerStartTimestamp)
                if context.state.isPlaying {
                    Text(timerInterval: timerStartDate...Date.distantFuture, countsDown: false)
                        .monospacedDigit()
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                } else {
                    Text(formattedElapsed(context.state.elapsedSeconds))
                        .monospacedDigit()
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundColor(.primary)
                }
            } minimal: {
                // 최소화 (두 개의 Live Activity가 경쟁할 때)
                Image(systemName: "book.closed.fill")
                    .font(.system(size: 12))
                    .foregroundColor(Color(red: 0.45, green: 0.28, blue: 0.10))
            }
        }
    }
}
