import Foundation
import Capacitor
import SwiftUI
import UIKit

// MARK: - Model

/// مدل مشترک بین SwiftUI و پلاگین. تب فعال و کال‌بکِ انتخاب رو نگه می‌داره.
final class TabBarModel: ObservableObject {
    @Published var active: String = "home"
    var onSelect: ((String) -> Void)?
}

// MARK: - SwiftUI Liquid Glass Tab Bar

struct GlassTabBar: View {
    @ObservedObject var model: TabBarModel
    @Namespace private var ns

    // رنگ accent اپ (#7B6EFF) و رنگ accent دوم (#4FACFE)
    private let accent = Color(red: 0.482, green: 0.431, blue: 1.0)
    private let accent2 = Color(red: 0.310, green: 0.675, blue: 0.996)

    private struct Item { let id: String; let icon: String; let label: String }
    private let leading: [Item] = [
        .init(id: "home",  icon: "house",      label: "خانه"),
        .init(id: "cards", icon: "creditcard", label: "کارت‌ها"),
    ]
    private let trailing: [Item] = [
        .init(id: "stats",   icon: "chart.bar", label: "آمار"),
        .init(id: "profile", icon: "person",    label: "پروفایل"),
    ]

    var body: some View {
        bar
            .padding(.horizontal, 16)
            .environment(\.layoutDirection, .rightToLeft)
    }

    @ViewBuilder private var bar: some View {
        let content = HStack(spacing: 2) {
            ForEach(leading, id: \.id) { tabButton($0) }
            addButton
            ForEach(trailing, id: \.id) { tabButton($0) }
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 7)
        .frame(maxWidth: .infinity)
        // حبابِ واحدِ تبِ فعال که با matchedGeometryEffect به anchorِ تبِ فعال قفل می‌شه و نرم می‌لغزه
        .background(slidingBubble)
        .animation(.spring(response: 0.42, dampingFraction: 0.82), value: model.active)

        if #available(iOS 26.0, *) {
            content.glassEffect(.regular, in: .capsule)
        } else {
            content.background(.ultraThinMaterial, in: Capsule())
                .overlay(Capsule().strokeBorder(Color.white.opacity(0.12), lineWidth: 0.5))
        }
    }

    // یک حبابِ تینت‌خورده‌ی واحد؛ id برابرِ تبِ فعاله، پس وقتی تب عوض می‌شه فریمش به تبِ جدید
    // مورف/اسلاید می‌کنه (الگوی استانداردِ indicatorِ متحرک).
    private var slidingBubble: some View {
        Capsule(style: .continuous)
            .fill(accent.opacity(0.20))
            .overlay(Capsule(style: .continuous).strokeBorder(accent.opacity(0.30), lineWidth: 0.5))
            .matchedGeometryEffect(id: model.active, in: ns, isSource: false)
    }

    private func tabButton(_ item: Item) -> some View {
        let isActive = model.active == item.id
        return Button {
            model.onSelect?(item.id)
        } label: {
            Image(systemName: isActive ? item.icon + ".fill" : item.icon)
                .font(.system(size: 20, weight: .semibold))
                .scaleEffect(isActive ? 1.08 : 1.0)
                .foregroundStyle(isActive ? accent : Color.white.opacity(0.45))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 11)
                // anchorِ این تب برای حبابِ متحرک
                .background(Color.clear.matchedGeometryEffect(id: item.id, in: ns, isSource: true))
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    private var addButton: some View {
        Button {
            model.onSelect?("add")
        } label: {
            Image(systemName: "plus")
                .font(.system(size: 21, weight: .bold))
                .foregroundStyle(.white)
                .frame(width: 44, height: 44)
                .background(
                    LinearGradient(colors: [accent, accent2],
                                   startPoint: .topLeading, endPoint: .bottomTrailing),
                    in: RoundedRectangle(cornerRadius: 14, style: .continuous)
                )
                .shadow(color: accent.opacity(0.45), radius: 9, y: 4)
        }
        .buttonStyle(.plain)
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Bridge View Controller (پلاگین لوکال رو دستی ثبت می‌کنه)

@objc(MainViewController)
public class MainViewController: CAPBridgeViewController {
    private let statusBarBlur = UIVisualEffectView(effect: nil)
    private var blurAnimator: UIViewPropertyAnimator?
    private let blurMask = CAGradientLayer()
    private let darkGradient = CAGradientLayer()

    public override func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeTabBarPlugin())
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        // blur خیلی ملایمِ زیر نوار وضعیت iOS تا محتوای وبِ زیرش خونا بمونه
        statusBarBlur.translatesAutoresizingMaskIntoConstraints = false
        statusBarBlur.isUserInteractionEnabled = false
        view.addSubview(statusBarBlur)
        NSLayoutConstraint.activate([
            statusBarBlur.topAnchor.constraint(equalTo: view.topAnchor),
            statusBarBlur.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            statusBarBlur.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            statusBarBlur.bottomAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor)
        ])

        // بلر خیلی کم (≈۱۵٪) — ملایم مثل اینستاگرام
        let animator = UIViewPropertyAnimator(duration: 1, curve: .linear) { [weak self] in
            self?.statusBarBlur.effect = UIBlurEffect(style: .systemThinMaterialDark)
        }
        animator.pausesOnCompletion = true
        animator.fractionComplete = 0.15
        blurAnimator = animator

        // گرادینتِ تیره روی بلر: متن‌های پشت رو تیره‌تر و بدونِ گلو می‌کنه، پایین محو می‌شه
        darkGradient.colors = [
            UIColor.black.withAlphaComponent(0.40).cgColor,
            UIColor.black.withAlphaComponent(0).cgColor
        ]
        darkGradient.locations = [0.0, 1.0]
        darkGradient.startPoint = CGPoint(x: 0.5, y: 0)
        darkGradient.endPoint = CGPoint(x: 0.5, y: 1)
        statusBarBlur.contentView.layer.addSublayer(darkGradient)

        // ماسکِ گرادینتی: بالا کامل، پایین محو می‌شه تا خط نیفته
        blurMask.colors = [UIColor.white.cgColor, UIColor.white.withAlphaComponent(0).cgColor]
        blurMask.locations = [0.55, 1.0]
        blurMask.startPoint = CGPoint(x: 0.5, y: 0)
        blurMask.endPoint = CGPoint(x: 0.5, y: 1)
        statusBarBlur.layer.mask = blurMask
    }

    public override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        blurMask.frame = statusBarBlur.bounds
        darkGradient.frame = statusBarBlur.bounds
        view.bringSubviewToFront(statusBarBlur) // همیشه روی webview بمونه
    }
}

// MARK: - Capacitor Plugin

@objc(NativeTabBarPlugin)
public class NativeTabBarPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeTabBarPlugin"
    public let jsName = "NativeTabBar"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "show", returnType: "promise"),
        CAPPluginMethod(name: "hide", returnType: "promise"),
        CAPPluginMethod(name: "setActive", returnType: "promise")
    ]

    private var hostingController: UIHostingController<GlassTabBar>?
    private let model = TabBarModel()

    @objc func show(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.model.onSelect = { [weak self] tab in
                guard let self = self else { return }
                if tab == "add" {
                    self.notifyListeners("addTapped", data: [:])
                } else {
                    self.model.active = tab
                    self.notifyListeners("tabSelected", data: ["tab": tab])
                }
            }

            if self.hostingController == nil {
                let container = self.bridge?.viewController?.view ?? self.webView?.superview
                guard let container = container else { call.resolve(); return }

                let hc = UIHostingController(rootView: GlassTabBar(model: self.model))
                hc.view.backgroundColor = .clear
                if #available(iOS 16.0, *) {
                    hc.sizingOptions = .intrinsicContentSize
                }
                hc.view.translatesAutoresizingMaskIntoConstraints = false
                container.addSubview(hc.view)
                NSLayoutConstraint.activate([
                    hc.view.leadingAnchor.constraint(equalTo: container.leadingAnchor),
                    hc.view.trailingAnchor.constraint(equalTo: container.trailingAnchor),
                    hc.view.bottomAnchor.constraint(equalTo: container.safeAreaLayoutGuide.bottomAnchor, constant: -6)
                ])
                self.hostingController = hc
            }
            self.hostingController?.view.isHidden = false
            call.resolve()
        }
    }

    @objc func hide(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.hostingController?.view.isHidden = true
            call.resolve()
        }
    }

    @objc func setActive(_ call: CAPPluginCall) {
        let tab = call.getString("tab") ?? "home"
        DispatchQueue.main.async {
            self.model.active = tab
            call.resolve()
        }
    }
}
