import Foundation
import ActivityKit

@objc(LiveActivityModule)
class LiveActivityModule: NSObject {

    // 현재 활성 Activity ID (String으로 저장 후 검색)
    private var currentActivityId: String?

    @objc
    func startActivity(_ params: NSDictionary) {
        guard #available(iOS 16.2, *) else { return }

        // 기존 Activity가 있으면 즉시 종료
        endCurrentActivity()

        let bookTitle = params["bookTitle"] as? String ?? "독서 중"
        let timerStartTimestamp = params["timerStartTimestamp"] as? Double ?? Date().timeIntervalSince1970
        let elapsedSeconds = params["elapsedSeconds"] as? Int ?? 0

        let attributes = TimerActivityAttributes(bookTitle: bookTitle)
        let contentState = TimerActivityAttributes.ContentState(
            isPlaying: true,
            elapsedSeconds: elapsedSeconds,
            timerStartTimestamp: timerStartTimestamp
        )

        do {
            let activity = try Activity<TimerActivityAttributes>.request(
                attributes: attributes,
                contentState: contentState,
                pushType: nil
            )
            currentActivityId = activity.id
        } catch {
            NSLog("[LiveActivity] startActivity 실패: %@", error.localizedDescription)
        }
    }

    @objc
    func updateActivity(_ params: NSDictionary) {
        guard #available(iOS 16.2, *) else { return }
        guard let activity = findCurrentActivity() else { return }

        let isPlaying = params["isPlaying"] as? Bool ?? false
        let elapsedSeconds = params["elapsedSeconds"] as? Int ?? 0
        let timerStartTimestamp = params["timerStartTimestamp"] as? Double ?? Date().timeIntervalSince1970

        let newState = TimerActivityAttributes.ContentState(
            isPlaying: isPlaying,
            elapsedSeconds: elapsedSeconds,
            timerStartTimestamp: timerStartTimestamp
        )

        Task {
            await activity.update(using: newState)
        }
    }

    @objc
    func endActivity() {
        guard #available(iOS 16.2, *) else { return }
        endCurrentActivity()
    }

    @available(iOS 16.2, *)
    private func findCurrentActivity() -> Activity<TimerActivityAttributes>? {
        guard let id = currentActivityId else { return nil }
        return Activity<TimerActivityAttributes>.activities.first { $0.id == id }
    }

    @available(iOS 16.2, *)
    private func endCurrentActivity() {
        // 추적 중인 것 + 이전 세션에서 남은 것 모두 종료
        for activity in Activity<TimerActivityAttributes>.activities {
            Task { await activity.end(dismissalPolicy: .immediate) }
        }
        currentActivityId = nil
    }

    @objc
    static func requiresMainQueueSetup() -> Bool { return false }
}
