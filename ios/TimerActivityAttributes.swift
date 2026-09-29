import ActivityKit
import Foundation

@available(iOS 16.1, *)
struct TimerActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        // 재생 중이면 true, 일시정지면 false
        var isPlaying: Bool
        // 일시정지 시 표시할 누적 초 (재생 중일 때는 timerStartTimestamp로 계산)
        var elapsedSeconds: Int
        // 타이머의 "가상 시작 시각" (Unix timestamp) = sessionStart/1000 - elapsedBase
        // SwiftUI가 이 시점부터 자동으로 카운트업함 (JS 업데이트 불필요)
        var timerStartTimestamp: Double
    }

    var bookTitle: String
}
